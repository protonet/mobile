require File.dirname(__FILE__) + '/modules/flash_server.rb'

# awesome stuff happening here
class ClientConnection < FlashServer
  attr_accessor :tracker
  
  def initialize tracker
    super()
    
    @tracker = tracker
  end
  
  def post_init
    super
    
    @key ||= rand(1000000)
    @tracker.add_conn self
    
    log('connected')
  end

  def receive_json(data)
    if data.is_a?(Hash) && data["operation"] == "authenticate"
      log("auth json: #{data["payload"].inspect}")
      if json_authenticate(data["payload"]) && !@subscribed
        # type of socket 'web', 'node' or 'api'
        @type = data["payload"]["type"] || 'api'
        @subscribed = true # don't resubscribe
        bind_socket_to_system_queue
        if @type == 'node' # special handling if you're a node
          @queues ||= []
          Channel.public.each do |channel|
            @queues << bind_channel(channel)
            @queues << bind_files_for_channel(channel)
            log("subscribing to channel #{channel.id}")
          end
        else # and you're a user for the rest of the cases
          bind_socket_to_user_queues
          add_to_online_users
          send_channel_subscriptions
        end
      else
        send_reload_request
      end
    elsif @user && data.is_a?(Hash)
      case data["operation"]
      when /^user\.(.*)/
        update_user_status($1)
      when /^ping$/
        send_ping_answer
      when /^work$/
        send_work_request(data)
      end
    else
      # play echoserver if request could not be understood
      send_data(data)
    end
  end

  def json_authenticate(auth_data)
    return false if auth_data.nil?
    
    if auth_data["user_id"]  # it's a user
      return false if auth_data["user_id"] == 0
      potential_user = User.find(auth_data["user_id"]) rescue nil
      @user = potential_user if potential_user && potential_user.communication_token_valid?(auth_data["token"])
      if @user
        log("authenticated #{potential_user.display_name}")
        send_json :x_target => 'socket_id', :socket_id => @key
      else
        log("could not authenticate #{auth_data.inspect}")
      end
    elsif auth_data["node_uuid"]
      @node = Network.find(auth_data["node_uuid"])
    end
    
    
  end
  
  def send_reload_request
    send_json :x_target => "document.location.reload"
  end
  
  def unbind
    log("connection closed")
    @tracker.remove_conn self
    remove_from_online_users # TODO: remove_conn should be do this
    unbind_socket_from_queues
  end

  def add_to_online_users
    @tracker.add_user @user, self
    refresh_users
  end

  def remove_from_online_users
    @tracker.remove_user @user, self
    refresh_users
  end
  
  def refresh_users
    send_and_publish 'system', 'system.users',
      :x_target => "protonet.Notifications.triggerFromSocket",
      :online_users => @tracker.online_users,
      :trigger => 'user.update_online_states'
  end
  
  def fill_channel_users
    @tracker.channel_users = {}
    Channel.all.each do |channel|
      @tracker.channel_users[channel.id] = channel.users(true).collect {|u| u.id}
    end
  end
  
  def send_channel_subscriptions
    fill_channel_users
    filtered_channel_users = {}
    @user.verified_channels.each do |channel|
      filtered_channel_users[channel.id] = @tracker.channel_users[channel.id]
    end
    
    send_json :x_target => 'protonet.Notifications.triggerFromSocket',
              :trigger => 'channel.update_subscriptions',
              :data => filtered_channel_users
  end
  
  def update_user_status(status)
    send_and_publish 'system', 'system.users',
      :x_target => "protonet.globals.userWidget.updateWritingStatus",
      :data => {:user_id => @user.id, :status => status}
  end

  def send_ping_answer
    send_json :x_target => "protonet.globals.dispatcher.pingSocketCallback"
  end

  def send_work_request(data)
    data.merge!({:user_id => @user.id})
    MQ.new.topic('system').publish(data.to_json, :key => 'worker.#')
  end

  def send_and_publish(topic, key, data)
    MQ.new.topic(topic).publish(data.to_json, :key => key)
    # due to some weird behaviour when calling publish
    # we need to send the data directly to the current socket
    send_json data
  end

  def bind_socket_to_system_queue
    @queues ||= []
    amq = MQ.new
    queue = amq.queue("system-queue-#{@key}", :auto_delete => true)
    queue.bind(amq.topic('system'), :key => 'system.#').subscribe do |msg|
      message = JSON(msg)
      message['x_target'] || message.merge!({:x_target => 'protonet.Notifications.triggerFromSocket'}) # jquery object
      log("got system message: #{msg.inspect}")
      send_json message
    end
    @queues << queue
  end

  def bind_socket_to_user_queues
    @queues ||= []
    @user.verified_channels.each do |channel|
      @queues << bind_channel(channel)
      @queues << bind_files_for_channel(channel)
      log("subscribing to channel #{channel.id}")
    end
    @queues << bind_user
    @subscribed = true
  end

  def bind_channel(channel)
    amq = MQ.new
    queue = amq.queue("consumer-#{@key}-channel.#{channel.id}", :auto_delete => true)
    queue.bind(amq.topic("channels"), :key => "channels.#{channel.uuid}").subscribe do |msg|
      message = JSON(msg)
      sender_socket_id = message['socket_id']
      # TODO the next line and this method need refactoring
      queue.unsubscribe if message['trigger'] == "channel.unsubscribe"
      message['x_target'] || message.merge!({:x_target => 'protonet.globals.communicationConsole.receiveMessage'})
      if !sender_socket_id || sender_socket_id.to_i != @key
        send_json message
      end
    end
    queue
  end

  def bind_files_for_channel(channel)
    amq = MQ.new
    queue = amq.queue("consumer-#{@key}-files.channel_#{channel.id}", :auto_delete => true)
    queue.bind(amq.topic("files"), :key => "files.channel_#{channel.id}").subscribe do |msg|
      message = JSON(msg)
      message['x_target'] || message.merge!({:x_target => 'protonet.Notifications.triggerFromSocket'}) # jquery object
      send_json message
    end
    queue
  end

  def bind_user
    amq = MQ.new
    queue = amq.queue("consumer-#{@key}-user", :auto_delete => true)
    queue.bind(amq.topic("users"), :key => "users.#{@user.id}").subscribe do |msg|
      message = JSON(msg)
      message['x_target'] || message.merge!({:x_target => 'protonet.Notifications.triggerFromSocket'}) # jquery object
      send_json message
    end
    queue
  end
  
  def unbind_socket_from_queues
    @queues && @queues.each {|q| q.unsubscribe}
  end
end

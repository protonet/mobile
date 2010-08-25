require File.dirname(__FILE__) + '/modules/flash_server.rb'
require File.dirname(__FILE__) + '/modules/rabbitmq.rb'

# awesome stuff happening here
class ClientConnection < FlashServer
  include RabbitMQ
  
  attr_accessor :key, :type, :tracker, :queues
  
  def initialize tracker
    super()
    
    @tracker = tracker
    @tracker.add_conn self
    
    @queues = []
    
    @key = rand(1000000)
  end
  
  def receive_json(data)
    if data.is_a?(Hash) && data["operation"] == "authenticate"
      log("auth json: #{data["payload"].inspect}")
      if json_authenticate(data["payload"]) && !@subscribed
        # type of socket 'web', 'node' or 'api'
        @type = data["payload"]["type"] || 'api'
        @subscribed = true # don't resubscribe
        bind_socket_to_system_queue
        
        if node? # special handling if you're a node
          @queues ||= []
          Channel.public.each do |channel|
            bind_channel(channel)
            bind_files_for_channel(channel)
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
      when 'ping'
        send_ping_answer
      when 'work'
        send_work_request(data)
      end
      
    else
      # play echoserver if request could not be understood
      send_json(data)
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
    unbind_queues
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
    send_and_publish 'system', 'users',
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
    send_and_publish 'system', 'users',
      :x_target => "protonet.globals.userWidget.updateWritingStatus",
      :data => {:user_id => @user.id, :status => status}
  end

  def send_ping_answer
    send_json :x_target => "protonet.globals.dispatcher.pingSocketCallback"
  end

  def send_work_request(data)
    data[:user_id] = @user.id
    publish 'system', '#', data
  end

  def send_and_publish(topic, key, data)
    publish topic, key, data
    
    # due to some weird behaviour when calling publish
    # we need to send the data directly to the current socket
    send_json data
  end

  def bind_socket_to_system_queue
    bind 'system', '#' do |json|
      log("got system message: #{json.inspect}")
      
      json['x_target'] ||= 'protonet.Notifications.triggerFromSocket' # jquery object
      send_json json
    end
  end

  def bind_socket_to_user_queues
    @user.verified_channels.each do |channel|
      bind_channel(channel)
      bind_files_for_channel(channel)
      log("subscribing to channel #{channel.id}")
    end
    
    bind_user
    @subscribed = true
  end

  def bind_channel(channel)
    bind 'channels', channel.uuid do |json|
      sender_socket_id = json['socket_id']
      # TODO the next line and this method need refactoring
      # TODO handle unsubscribing in the first place
      #queue.unsubscribe if json['trigger'] == "channel.unsubscribe"
      json['x_target'] ||= 'protonet.globals.communicationConsole.receiveMessage'
      send_json json if !sender_socket_id || sender_socket_id.to_i != @key
    end
  end

  def bind_files_for_channel(channel)
    bind 'files', 'channel', channel.uuid do |json|
      json['x_target'] ||= 'protonet.Notifications.triggerFromSocket' # jquery object
      send_json json
    end
  end

  def bind_user
    bind 'users', @user.id do |json|
      json['x_target'] ||= 'protonet.Notifications.triggerFromSocket' # jquery object
      send_json json
    end
  end
  
  def web?;  @type == 'web';  end
  def api?;  @type == 'api';  end
  def node?; @type == 'node'; end
  
  def queue_id; "consumer-#{@key}"; end
  def to_s; @key; end
end

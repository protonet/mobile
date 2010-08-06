#!/usr/bin/env ruby
# this is here to make sure environment.rb doens't recreate the EventMachine Loop
RUN_FROM_DISPATCHER = true
require File.dirname(__FILE__) + '/../../config/environment'
require File.dirname(__FILE__) + '/modules/flash_server.rb'

# awesome stuff happening here
module JsDispatchingServer

  @@online_users  = {}
  @@channel_users = {}
  @@open_sockets  = []

  def post_init
    self.set_comm_inactivity_timeout(60)
    @key ||= rand(1000000)
    @@open_sockets << self
    log('post-init')
    log('opened')
  end

  def receive_data(data)
    log("received: #{data}")
    data = begin
      JSON.parse(data.chomp("\000"))
    rescue JSON::ParserError
      log("JSON PARSE ERROR! was this intended?")
      data
    end
    handle_received_json(data)
  end

  def handle_received_json(data)
    if data.is_a?(Hash) && data["operation"] == "authenticate"
      log("auth json: #{data["payload"].inspect}")
      if json_authenticate(data["payload"]) && !@subscribed
        # type of socket 'web' or 'api'
        @type = data["payload"]["type"] || 'api'
        bind_socket_to_system_queue
        bind_socket_to_user_queues
        add_to_online_users
        send_channel_subscriptions
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
    return false if auth_data["user_id"] == 0
    potential_user = User.find(auth_data["user_id"]) rescue nil

    @user = potential_user if potential_user && potential_user.communication_token_valid?(auth_data["token"])
    if @user
      log("authenticated #{potential_user.display_name}")
      send_data("#{{"trigger" => "socket.update_id", "socket_id" => "#{@key}"}.to_json}\0")
    else
      log("could not authenticate #{auth_data.inspect}")
    end
  end
  
  def send_reload_request
    data = {:x_target => "document.location.reload"}.to_json
    send_data(data + "\0")
  end
  
  def unbind
    log("connection #{@key} closed")
    @@open_sockets = @@open_sockets.reject {|s| s == self}
    remove_from_online_users
    unbind_socket_from_queues
  end

  def add_to_online_users
    @@online_users[@user.id] ||= {}
    @@online_users[@user.id]["name"] ||= @user.display_name
    @@online_users[@user.id]["connections"] ||= []
    @@online_users[@user.id]["connections"]  << [@key, @type]
    data = {:x_target => "protonet.globals.userWidget.update", :online_users => @@online_users}.to_json
    send_and_publish('system','system.users', data)
  end

  def remove_from_online_users
    return unless @user
    @@online_users[@user.id]["connections"] = @@online_users[@user.id]["connections"].reject {|socket_id, _| socket_id == @key}
    @@online_users.delete(@user.id) if @@online_users[@user.id]["connections"].empty?
    data = {:x_target => "protonet.globals.userWidget.update", :online_users => @@online_users}.to_json
    send_and_publish('system','system.users', data)
  end
  
  def fill_channel_users
    @@channel_users = {}
    Channel.all.each do |channel|
      @@channel_users[channel.id] = channel.users.collect {|u| u.id}
    end
  end
  
  def send_channel_subscriptions
    fill_channel_users
    filtered_channel_users = {}
    @user.channels.each do |channel|
      filtered_channel_users[channel.id] = @@channel_users[channel.id]
    end
    data = {:trigger => 'channel.update_subscriptions', :data => filtered_channel_users}.to_json
    send_data(data + "\0")
  end
  
  def update_user_status(status)
    data = {:x_target => "protonet.globals.userWidget.updateWritingStatus", :data => {:user_id => @user.id, :status => status}}.to_json
    send_and_publish('system','system.users', data)
  end

  def send_ping_answer
    data = {:x_target => "protonet.globals.dispatcher.pingSocketCallback"}.to_json
    send_data(data + "\0")
  end

  def send_work_request(data)
    data.merge!({:user_id => @user.id})
    amq = MQ.new
    amq.topic('system').publish(data.to_json, :key => 'worker.#')
  end

  def send_and_publish(topic, key, data)
    amq = MQ.new
    amq.topic(topic).publish(data, :key => key)
    # due to some weird behaviour when calling publish
    # we need to send the data directly to the current socket
    send_data(data + "\0")
  end

  def bind_socket_to_system_queue
    @queues ||= []
    amq = MQ.new
    queue = amq.queue("system-queue-#{@key}", :auto_delete => true)
    queue.bind(amq.topic('system'), :key => 'system.#').subscribe do |msg|
      log("got system message: #{msg.inspect}")
      send_data("#{msg}\0")
    end
    @queues << queue
  end

  def bind_socket_to_user_queues
    @queues ||= []
    @user.channels.each do |channel|
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
    queue.bind(amq.topic("channels"), :key => "channels.#{channel.id}").subscribe do |msg|
      message = JSON(msg)
      sender_socket_id = message['socket_id']
      # TODO the next line and this method need refactoring
      queue.unsubscribe if message['trigger'] =="channel.unsubscribe"
      message['x_target'] || message.merge!({:x_target => 'protonet.globals.communicationConsole.receiveMessage'})
      if !sender_socket_id || sender_socket_id.to_i != @key
        message_json = message.to_json
        log('sending data out: ' + message_json + ' ' + sender_socket_id.to_s)
        send_data("#{message_json}\0")
      end
    end
    queue
  end

  def bind_files_for_channel(channel)
    amq = MQ.new
    queue = amq.queue("consumer-#{@key}-files.channel_#{channel.id}", :auto_delete => true)
    queue.bind(amq.topic("files"), :key => "files.channel_#{channel.id}").subscribe do |msg|
      log('sending data out: ' + msg)
      send_data("#{msg}\0")
    end
    queue
  end

  def bind_user
    amq = MQ.new
    queue = amq.queue("consumer-#{@key}-user", :auto_delete => true)
    queue.bind(amq.topic("users"), :key => "users.#{@user.id}").subscribe do |msg|
      log('sending data out: ' + msg)
      send_data("#{msg}\0")
    end
    queue
  end
  
  def unbind_socket_from_queues
    @queues && @queues.each {|q| q.unsubscribe}
  end

  include FlashServer

  def log(text)
    puts "connection #{@key && @key.inspect || 'uninitialized'}: #{text}" # if $DEBUG
  end

end

EventMachine::run do
  host = '0.0.0.0'
  port = configatron.socket.port rescue 5000
  EventMachine.epoll if RUBY_PLATFORM =~ /linux/ #sky is the limit
  EventMachine::start_server(host, port, JsDispatchingServer)
  puts "Started JsDispatchingServer on #{host}:#{port}..."
  puts $$
end

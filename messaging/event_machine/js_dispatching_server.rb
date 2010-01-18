#!/usr/bin/env ruby
# this is here to make sure environment.rb doens't recreate the EventMachine Loop
RUN_FROM_DISPATCHER = true
require File.dirname(__FILE__) + '/../../config/environment'
require File.dirname(__FILE__) + '/modules/flash_server.rb'

# awesome stuff happening here
module JsDispatchingServer
  
  @@online_users = {}
  @@open_sockets = []
  
  def post_init
    @key ||= rand(100000)
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
    if data.is_a?(Hash) && data["operation"] == "authenticate"
      log("auth json: #{data["payload"].inspect}")
      if json_authenticate(data["payload"]) && !@subscribed
        bind_socket_to_queues
      end
    else
      # play echoserver if request could not be understood
      send_data(data)
    end
    
  end
  
  def unbind
    log("connection #{@key} closed")
    @@open_sockets = @@open_sockets.reject {|s| s == self}
    remove_from_online_users
    unbind_socket_from_queues
  end
  
  def add_to_online_users
    @@online_users[@user.id] ||= []
    @@online_users[@user.id] << @key
    data = {:x_target => "UserWidget.update", :online_users => @@online_users}.to_json + "\0"
    @@open_sockets.each {|s| s.send_data(data)}
    log(@@online_users.inspect)
    Rails.cache.write("online_users", @@online_users)
  end
  
  def remove_from_online_users
    return unless @user
    @@online_users[@user.id] = @@online_users[@user.id].reject {|socket_id| socket_id == @key}
    @@online_users.delete(@user.id) if @@online_users[@user.id].empty?
    data = {:x_target => "UserWidget.update", :online_users => @@online_users}.to_json + "\0"
    @@open_sockets.each {|s| s.send_data(data)}
    log(@@online_users.inspect)
    Rails.cache.write("online_users", @@online_users)
  end
  
  def json_authenticate(auth_data)
    return false if auth_data.nil?
    return false if auth_data["user_id"] == 0
    potential_user = User.find(auth_data["user_id"])
    
    @user = potential_user if potential_user && potential_user.communication_token_valid?(auth_data["token"])
    if @user
      log("authenticated #{potential_user.display_name}")
      send_data("#{{"x_target" => "socket_id", "socket_id" => "#{@key}"}.to_json}\0")
      bind_socket_to_queues
      add_to_online_users
    else
      log("could not authenticate #{auth_data.inspect}")
    end
  end
  
  def bind_socket_to_queues
    @queues = []
    amq = MQ.new
    @user.channels.each do |channel|
      channel_queue = amq.queue("consumer-#{@key}-channel.a#{channel.id}", :auto_delete => true)
      channel_queue.bind(amq.topic("channels"), :key => "channels.a#{channel.id}").subscribe do |msg|
        message = JSON(msg)
        sender_socket_id = message['socket_id']
        message.merge!({:x_target => 'cc.receiveMessage'})
        if sender_socket_id && sender_socket_id.to_i != @key
          message_json = message.to_json
          log('sending data out: ' + message_json + ' ' + sender_socket_id)
          send_data("#{message_json}\0")
        end
      end
      @queues << channel_queue
      log("subscribing to channel #{channel.id}")
    end
    @subscribed = true
  end 
  
  def unbind_socket_from_queues
    @queues && @queues.each {|q| q.unsubscribe}
  end
  
  include FlashServer
  
  def log(text)
    puts "connection #{@key && @key.inspect || 'uninitialized'}: #{text}"
  end

end

EventMachine::run do
  host = '0.0.0.0'
  port = 5000
  EventMachine.epoll if RUBY_PLATFORM =~ /linux/ #sky is the limit
  EventMachine::start_server(host, port, JsDispatchingServer)
  puts "Started JsDispatchingServer on #{host}:#{port}..."
  puts $$
end

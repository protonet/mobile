#!/usr/bin/env ruby
# this is here to make sure environment.rb doens't recreate the EventMachine Loop
RUN_FROM_DISPATCHER = true
require 'rubygems'
require 'active_record'
require 'yaml'
require 'configatron'
require 'eventmachine'
require 'json'
require 'mq'
require File.dirname(__FILE__) + '/modules/flash_server.rb'
require File.dirname(__FILE__) + '/../../vendor/plugins/restful-authentication/init.rb'

dbconfig = YAML::load(File.open(File.dirname(__FILE__)  + '/../../config/database.yml'))
ActiveRecord::Base.establish_connection(dbconfig[ENV["RAILS_ENV"] || "development"])

require File.dirname(__FILE__) + '/../../app/models/user.rb'
require File.dirname(__FILE__) + '/../../app/models/listen.rb'
require File.dirname(__FILE__) + '/../../app/models/channel.rb'

# awesome stuff happening here
module JsDispatchingServer
  
  @@online_users = {}
  @@open_sockets = []
    
  def post_init
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
      end
    elsif @user && data.is_a?(Hash)
      case data["operation"]
      when /^user\.(.*)/
        update_user_status($1)
      when /^ping$/
        @@online_users[@user.id] ||= {}
        @@online_users[@user.id]["last_seen"] = Time.now.to_i
        log('crazy got ping!!')
      end
    else
      # play echoserver if request could not be understood
      send_data(data)
    end
  end
  
  def json_authenticate(auth_data)
    return false if auth_data.nil?
    return false if auth_data["user_id"] == 0
    potential_user = User.find(auth_data["user_id"])
    
    @user = potential_user if potential_user && potential_user.communication_token_valid?(auth_data["token"])
    if @user
      log("authenticated #{potential_user.display_name}")
      send_data("#{{"x_target" => "socket_id", "socket_id" => "#{@key}"}.to_json}\0")
    else
      log("could not authenticate #{auth_data.inspect}")
    end
  end
  
  def unbind
    log("connection #{@key} closed")
    @@open_sockets = @@open_sockets.reject {|s| s == self}
    remove_from_online_users
    unbind_socket_from_queues
  end
  
  def add_to_online_users
    @@online_users[@user.id] ||= {}
    @@online_users[@user.id]["connections"] ||= []
    @@online_users[@user.id]["connections"] << [@key, @type]
    data = {:x_target => "UserWidget.update", :online_users => @@online_users}.to_json
    send_user_data(data)
    log(@@online_users.inspect)
  end
  
  def remove_from_online_users
    return unless @user
    @@online_users[@user.id]["connections"] = @@online_users[@user.id]["connections"].reject {|socket_id, _| socket_id == @key}
    @@online_users.delete(@user.id) if @@online_users[@user.id]["connections"].empty?
    data = {:x_target => "UserWidget.update", :online_users => @@online_users}.to_json
    send_user_data(data)
    log(@@online_users.inspect)
  end
  
  def update_user_status(status)
    data = {:x_target => "UserWidget.updateWritingStatus", :data => {:user_id => @user.id, :status => status}}.to_json
    send_user_data(data)
  end
  
  def send_user_data(data)
    amq = MQ.new
    amq.topic("system").publish(data, :key => "system.user")
    # due to some weird behaviour when calling publish
    # we need to send the data directly to the current socket
    send_data(data + "\0")
  end

  def bind_socket_to_system_queue
    @queues ||= []
    amq = MQ.new
    queue = amq.queue("system-queue-#{@key}", :auto_delete => true)
    queue.bind(amq.topic('system'), :key => 'system.#').subscribe do |msg|
      send_data(msg + "\0")
      log("got system message: #{msg.inspect}")
    end
    @queues << queue
  end

  def bind_socket_to_user_queues
    @queues ||= []
    amq = MQ.new
    @user.channels.each do |channel|
      channel_queue = amq.queue("consumer-#{@key}-channel.a#{channel.id}", :auto_delete => true)
      channel_queue.bind(amq.topic("channels"), :key => "channels.a#{channel.id}").subscribe do |msg|
        message = JSON(msg)
        sender_socket_id = message['socket_id']
        message.merge!({:x_target => 'protonet.globals.communicationConsole.receiveMessage'})
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
  EventMachine::PeriodicTimer.new(45) do
    online_users = JsDispatchingServer.send(:class_variable_get, :@@online_users)
    online_users.each do |u|
      puts("#{online_users.inspect}")
    end
  end
end

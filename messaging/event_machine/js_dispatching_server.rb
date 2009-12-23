#!/usr/bin/env ruby
# this is here to make sure environment.rb doens't recreate the EventMachine Loop
RUN_FROM_DISPATCHER = true
require File.dirname(__FILE__) + '/../../config/environment'
require File.dirname(__FILE__) + '/modules/flash_server.rb'

# awesome stuff happening here
module JsDispatchingServer
  
  def post_init
    @key ||= rand(100000)
    log('post-init')
    log('opened')
  end
  
  def receive_data(data)
    log("received: #{data}")
    data = begin 
      JSON.parse(data.chomp("\000"))
    rescue JSON::ParserError
      data
    end
    if data.is_a?(Hash) && data["operation"] == "authentication"
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
    # @user && @user.joined_rooms.each do |room|
    #   @user.leave_room(room)
    # end
  end
  
  def json_authenticate(auth_data)
    potential_user = User.find(auth_data["user_id"])
    
    @user = potential_user if potential_user && potential_user.communication_token_valid?(auth_data["token"])
    if potential_user
      log("authenticated #{potential_user.display_name}")
      send_data("#{{"x_target" => "socket_id", "socket_id" => "#{@key}"}.to_json}\0")
      bind_socket_to_queues
    else
      log("could not authenticate #{auth_data.inspect}")
    end
  end
  
  def bind_socket_to_queues
    amq = MQ.new
    @user.channels.each do |channel|
      amq.queue("consumer-#{@key}-channel.a#{channel.id}").bind(amq.topic("channels"), :key => "channels.a#{channel.id}").subscribe{ |msg|
        message = JSON(msg)
        sender_socket_id = message['socket_id']
        message.merge!({:x_target => 'cc.receiveMessage'})
        if sender_socket_id && sender_socket_id.to_i != @key
          message_json = message.to_json
          log('sending data out: ' + message_json + ' ' + sender_socket_id)
          send_data("#{message_json}\0")
        end
      }
      log("subscribing to channel #{channel.id}")
    end
    @subscribed = true
  end 
  
  def unbind_socket_from_queues
    # not implemented yet
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

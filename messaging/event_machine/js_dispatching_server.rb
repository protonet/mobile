#!/usr/bin/env ruby
RUN_FROM_DISPATCHER = true
require File.dirname(__FILE__) + '/../../config/environment'

require 'ruby-debug'
require File.dirname(__FILE__) + '/modules/flash_server.rb'

Debugger.start

# preload models for cache returns:
User
Audience
Say
Listen
Tweet
# done preloading models

# awesome stuff happening here
module JsDispatchingServer
  
  def post_init
    @key ||= rand(100000)
    log('post-init')
    log('opened')
  end
  
  def receive_data(data)
    log("received: #{data}")
    if data.match(/^auth_response:(.*)/)
      # bind_socket_to_queues()
      auth = JSON.parse($1.chomp("\000"))
      log("auth json: #{auth.inspect}")
      if authenticate_user(auth) && !@subscribed
        bind_socket_to_queues
      end
    else
      send_data(data)
    end
    
  end
  
  def unbind
    log("connection #{@key} closed")
    # @user && @user.joined_rooms.each do |room|
    #   @user.leave_room(room)
    # end
  end
  
  def authenticate_user(auth_data)
    potential_user = User.find(auth_data["user_id"])
    
    @user = potential_user if potential_user && potential_user.communication_token_valid?(auth_data["token"])
    if potential_user
      log("authenticated #{potential_user.display_name}")
      send_data("#{{"x_target" => "connection_id", "connection_id" => "#{@key}"}.to_json}\0")
      bind_socket_to_queues
    else
      log("could not authenticate #{auth_data.inspect}")
      debugger
    end
  end
  
  def bind_socket_to_queues
    amq = MQ.new
    @user.audiences.each do |audience|
      amq.queue("consumer-#{@key}-audience.a#{audience.id}").bind(amq.topic("audiences"), :key => "audiences.a#{audience.id}").subscribe{ |msg|
        message = {"target" => "communication_console", "message" => "#{msg}"}
        log('sending data out: ' + message.to_json)
        send_data("#{message.to_json}\0")
      }
      log("subscribing to audience #{audience.id}")
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

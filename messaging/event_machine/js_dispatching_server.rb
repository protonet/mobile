#!/usr/bin/env ruby
require File.dirname(__FILE__) + '/../../config/environment'

require 'ruby-debug'
require File.dirname(__FILE__) + '/modules/flash_server.rb'

Debugger.start

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
    end
  end
  
  def unbind
    log("connection #{@key} closed")
    @user && @user.joined_rooms.each do |room|
      @user.leave_room(room)
    end
  end
  
  def authenticate_user(auth_data)
    potential_user = User.first #User.get(auth_data["user_id"])
    @user = potential_user if potential_user # && potential_user.token_valid?(auth_data["token"])
    if potential_user
      log("authenticated #{potential_user.display_name}") 
      bind_socket_to_queues
    else
      log("could not authenticate #{auth_data.inspect}")
      debugger
    end
  end
  
  def bind_socket_to_queues
    amq = MQ.new
    @user.joined_rooms.each do |room|
      amq.queue("consumer-#{@key}-chats").bind(amq.topic('chats'), :key => "chats.r#{room.id}").subscribe{ |msg|
        send_data("chats_" + msg + "\0")
      }
      log("subscribing to room #{room.id}")
    end
    amq.queue("consumer-#{@key}-assets").bind(amq.topic('assets'), :key => 'assets.all').subscribe{ |msg|
      send_data("assets_" + msg + "\0")
    }
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

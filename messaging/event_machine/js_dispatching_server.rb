#!/usr/bin/env ruby
require 'rubygems'
require 'eventmachine'
require 'json'
require 'ruby-debug'
# the following is needed when you run the dispatcher in an merb env
# it needs to be reworked, a whole env just for db/model access is overkill`
module_path = defined?(Merb) ? Merb.root + '/messaging/event_machine' : File.dirname(__FILE__)
require(module_path + "/modules/flash_server.rb")
require 'mq'
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
      auth = JSON.parse($1.chop)
      if authenticate_user(auth) && !@subscribed
        bind_socket_to_queues
      end
    end
  end
  
  def unbind
    log("connection #{@key} closed")
  end
  
  def authenticate_user(auth_data)
    potential_user = User.get(auth_data[:id])
    @user = potential_user && potential_user.token_valid?(auth_data[:token])
  end
  
  def bind_socket_to_queues
    amq = MQ.new
    amq.queue("consumer-#{@key}-chats").bind(amq.topic('chats'), :key => 'chats.r1').subscribe{ |msg|
      send_data("chats_" + msg + "\0")
    }
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

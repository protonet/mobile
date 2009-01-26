#!/usr/bin/env ruby
require 'rubygems'
require 'eventmachine'
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
    if data.match(/auth_response\{.key.:.(.*).\}/)
      # bind_socket_to_queues()
      debugger
      authenticate_user($1)
    end
  end
  
  def unbind
    log("connection #{@key} closed")
  end
  
  def authenticate_user(key)
    
  end
  
  def bind_socket_to_queues
    amq = MQ.new
    amq.queue("consumer-#{@key}-chats").bind(amq.topic('chats'), :key => 'chats.r1').subscribe{ |msg|
      send_data("chats_" + msg + "\0")
    }
    amq.queue("consumer-#{@key}-assets").bind(amq.topic('assets'), :key => 'assets.all').subscribe{ |msg|
      send_data("assets_" + msg + "\0")
    }
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

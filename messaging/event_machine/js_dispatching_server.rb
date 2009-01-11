#!/usr/bin/env ruby
require 'rubygems'
require 'eventmachine'
require 'ruby-debug'
require File.dirname(__FILE__) + "/modules/flash_server.rb"
require 'mq'
Debugger.start

# awesome stuff happening here
module JsDispatchingServer
  
  def post_init
    log('post-init')
    # @key ||= get_sockname # this didn't work as I expected it to
    @key ||= rand(100000)
    puts "#{@key.inspect}"
    amq = MQ.new
    amq.queue("consumer-#{@key}").bind(amq.topic('chats'), :key => 'chats.r1').subscribe{ |msg|
      send_data(msg + "\0\n")
    }
  end
  
  def receive_data(data)
  end
  
  def log(text)
    puts "#{self.class.to_s}: #{text}"
  end
  
  include FlashServer

end

EventMachine::run do
  host = '0.0.0.0'
  port = 5000
  EventMachine.epoll if RUBY_PLATFORM =~ /linux/ #sky is the limit
  EventMachine::start_server(host, port, JsDispatchingServer)
  puts "Started JsDispatchingServer on #{host}:#{port}..."
  puts $$
end

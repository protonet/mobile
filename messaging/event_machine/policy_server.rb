# this is deprecated:
# we won't be using a flash policy server on this port since
# ports below 1024 need sudo rights and make the whole starting
# stopping much too complicated
# policy handling will be done by the js_dispatching_server

#!/usr/bin/env ruby
require 'rubygems'
require 'eventmachine'
require File.dirname(__FILE__) + "/modules/flash_server.rb"

# require 'ruby-debug'
# Debugger.start

# simple flash policy server, answers for policy request on port
module FlashPolicyServer
  
  def receive_data(data)
  end
  
  include FlashServer
end

EventMachine::run do
  host = '0.0.0.0'
  port = 843
  EventMachine.epoll if RUBY_PLATFORM =~ /linux/ #sky is the limit
  EventMachine::start_server(host, port, FlashPolicyServer)
  puts "Started FlashPolicyServer on #{host}:#{port}..."
  puts $$
end


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
  
  include FlashServer # move me up if you know how!
end

EventMachine::run do
  host = '0.0.0.0'
  port = 843
  EventMachine.epoll if RUBY_PLATFORM =~ /linux/ #sky is the limit
  EventMachine::start_server(host, port, FlashPolicyServer)
  puts "Started FlashPolicyServer on #{host}:#{port}..."
end


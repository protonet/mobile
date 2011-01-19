#!/usr/bin/env ruby

require 'rubygems'
require 'eventmachine'
require 'evma_httpserver'

# this is here to make sure environment.rb doens't recreate the EventMachine Loop
RUN_FROM_DISPATCHER = true

require File.dirname(__FILE__) + '/../../config/environment'

require File.dirname(__FILE__) + '/node_connection.rb'
require File.dirname(__FILE__) + '/client_connection.rb'
require File.dirname(__FILE__) + '/http_connection.rb'
require File.dirname(__FILE__) + '/client_tracker.rb'

EventMachine::run do
  host = '0.0.0.0'
  port = configatron.socket.port rescue 5000
  longpolling_port = configatron.longpolling.port rescue 8000
  
  tracker = ClientTracker.new
  NodeConnection.tracker = tracker
  
  EventMachine.epoll if RUBY_PLATFORM =~ /linux/ #sky is the limit
  EventMachine::start_server host, port, ClientConnection, tracker
  EventMachine::start_server host, longpolling_port, HttpConnection, tracker

  
  puts "Started socket server on #{host}:#{port}..."
  puts $$
  
  Network.all(:conditions => {:coupled => true}).each do |network|
    NodeConnection.negotiate network, tracker
  end
  
  trap("INT") do
    # reset connection tracker, needed for tests
    puts "resetting connection tracker"
    connections = tracker.open_sockets.each {|s| s.send_reconnect_request}
  end
  
end

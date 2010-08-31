#!/usr/bin/env ruby

# this is here to make sure environment.rb doens't recreate the EventMachine Loop
RUN_FROM_DISPATCHER = true

require File.dirname(__FILE__) + '/../../config/environment'

require File.dirname(__FILE__) + '/node_connection.rb'
require File.dirname(__FILE__) + '/client_connection.rb'
require File.dirname(__FILE__) + '/client_tracker.rb'

EventMachine::run do
  host = '0.0.0.0'
  port = configatron.socket.port rescue 5000
  
  tracker = ClientTracker.new
  
  EventMachine.epoll if RUBY_PLATFORM =~ /linux/ #sky is the limit
  EventMachine::start_server host, port, ClientConnection, tracker
  
  puts "Started socket server on #{host}:#{port}..."
  puts $$
  
  Network.all(:conditions => {:coupled => true}).each do |network|
    NodeConnection.connect network, tracker
  end
end

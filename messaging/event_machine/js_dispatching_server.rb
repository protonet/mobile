#!/usr/bin/env ruby

require 'rubygems'
require 'eventmachine'
require 'evma_httpserver'

# this is here to make sure environment.rb doens't recreate the EventMachine Loop
RUN_FROM_DISPATCHER = true

require File.dirname(__FILE__) + '/../../config/environment'

require File.dirname(__FILE__) + '/modules/node_connection.rb'
require File.dirname(__FILE__) + '/modules/client_connection.rb'
require File.dirname(__FILE__) + '/modules/http_connection.rb'
require File.dirname(__FILE__) + '/modules/websocket_connection.rb'
require File.dirname(__FILE__) + '/modules/websocket_ssl_connection.rb'
require File.dirname(__FILE__) + '/modules/rpc.rb'
require File.dirname(__FILE__) + '/client_tracker.rb'
require File.dirname(__FILE__) + '/node_tracker.rb'

def solr_index_processing
  begin
    if SystemPreferences.show_search_widget
      puts "==== solr index queue processing ========="
      Sunspot::IndexQueue.new.process
      puts "==== solr index queue processing done ===="
    end
    EventMachine::add_timer(30) {
      solr_index_processing
    }
  rescue Exception => e
    puts "==== solr indexing exception ===="
    puts "#{e}"
    puts "================================="
    # If Solr isn't responding, wait a while to give it time to get back up
    if e.is_a?(Sunspot::IndexQueue::SolrNotResponding)
      EventMachine::add_timer(30) {
        solr_index_processing
      }
    else
      Rails.logger.error(e)
    end
  end
end

EventMachine::run do
  host = '0.0.0.0'
  port              = !configatron.socket.port.nil? && configatron.socket.port || 5000
  longpolling_port  = !configatron.xhr_streaming.port.nil? && configatron.xhr_streaming.port || 8000
  websocket_port    = !configatron.websocket.port.nil? && configatron.websocket.port || 5001
  websocket_ssl_port= !configatron.websocket_ssl.port.nil? && configatron.websocket_ssl.port || 5002

  puts "Starting AMQ RPC server"
  $rpc = RPC.new
  
  client_tracker = ClientTracker.new
    
  EventMachine.epoll if RUBY_PLATFORM =~ /linux/ #sky is the limit
  EventMachine::start_server host, port, ClientConnection, client_tracker
  EventMachine::start_server host, longpolling_port, HttpConnection, client_tracker
  EventMachine::start_server host, websocket_port, WebsocketConnection, client_tracker
  EventMachine::start_server host, websocket_ssl_port, WebsocketSslConnection, client_tracker
  
  puts "Started socket server on #{host}:#{port}..."
  puts $$
  
  # async solr indexing
  solr_indexing = Proc.new {
    solr_index_processing
  }
  EM.defer(solr_indexing)
  puts "\nStarted background SOLR indexing...\n"
  
  node_tracker = NodeTracker.new(client_tracker)
  node_tracker.bind_nodes_queue
  Node.all.each do |node|
    NodeConnection.connect node, node_tracker if node.api_user_id
  end
  
  EventMachine::add_periodic_timer(10) {
    p "="*50 + " nodes connected:" + node_tracker.online_nodes.keys.inspect
  }
  
  trap("HUP") do
    # reset connection tracker, needed for tests
    puts "resetting connection tracker"
    connections = client_tracker.open_sockets.each {|s| s.send_reconnect_request}
  end
  
end


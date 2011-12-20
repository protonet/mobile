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
require File.dirname(__FILE__) + '/client_tracker.rb'
require File.dirname(__FILE__) + '/node_tracker.rb'

# RPC handler
require File.join(::Rails.root, 'lib', 'rpc', 'handler')

solr_index_processing = proc do
  begin
    if SystemPreferences.show_search_widget
      print "#{Time.now.strftime('%T')}: Processing Solr index queue... "
      Sunspot::IndexQueue.new.process
      puts "done."
    end
    EventMachine::add_timer(30, &solr_index_processing)
  rescue Exception => e
    puts "==== Solr indexing exception ===="
    puts "#{e.class}: #{e.message}"
    puts "================================="
    # If Solr isn't responding, wait a while to give it time to get back up
    if e.is_a?(Sunspot::IndexQueue::SolrNotResponding)
      EventMachine::add_timer(30, &solr_index_processing)
    else
      Rails.logger.error(e)
    end
  end
end

EventMachine::run do
  puts
  puts "Loading socket server:"
  puts "  - PID: #{$$}"
  
  host = '0.0.0.0'
  socket_port        = !configatron.socket.port.nil?        && configatron.socket.port        || 5000
  longpolling_port   = !configatron.xhr_streaming.port.nil? && configatron.xhr_streaming.port || 8000
  websocket_port     = !configatron.websocket.port.nil?     && configatron.websocket.port     || 5001
  websocket_ssl_port = !configatron.websocket_ssl.port.nil? && configatron.websocket_ssl.port || 5002

  rpc = Rpc::Handler.new
  rpc.bind_rabbit
  puts "  - Started AMQ RPC server with #{rpc.objects.size} objects"
  
  client_tracker = ClientTracker.new
  node_tracker = NodeTracker.new(client_tracker)
  node_tracker.bind_nodes_queue
  puts "  - Created client and node trackers"
  
  if RUBY_PLATFORM =~ /linux/
    EventMachine.epoll
    puts "  - Using EPoll; the sky is the limit"
  end
  
  EventMachine::start_server host, socket_port,        ClientConnection,       client_tracker
  EventMachine::start_server host, longpolling_port,   HttpConnection,         client_tracker
  EventMachine::start_server host, websocket_port,     WebsocketConnection,    client_tracker
  EventMachine::start_server host, websocket_ssl_port, WebsocketSslConnection, client_tracker
  puts "  - Started socket server on #{host}:#{socket_port}"
  
  # async solr indexing
  EM.defer do
    EventMachine::add_timer(15, &solr_index_processing)
  end
  puts "  - Started background SOLR indexing"
  
  Node.all.each do |node|
    if node.api_user_id
      NodeConnection.connect node, node_tracker
      puts "  - Queued node2node connection with #{node.url}"
    end
  end
  
  trap("HUP") do
    # reset connection tracker, needed for tests
    puts "Got HUP, resetting connection tracker"
    connections = client_tracker.open_sockets.each {|s| s.send_reconnect_request}
  end
  
  puts "Done setting up."
  puts
end


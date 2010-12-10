#!/usr/bin/env ruby

# require 'rubygems'
# require 'eventmachine'
# removed I'm getting a no such file to load -- evma_httpserver (LoadError)
# require 'evma_httpserver'

# this is here to make sure environment.rb doens't recreate the EventMachine Loop
RUN_FROM_DISPATCHER = true

require File.dirname(__FILE__) + '/../../config/environment'

require File.dirname(__FILE__) + '/node_connection.rb'
require File.dirname(__FILE__) + '/client_connection.rb'
require File.dirname(__FILE__) + '/client_tracker.rb'

#  see comment on gem above
# class MyHttpServer < EM::Connection
#   include EM::HttpServer
# 
#   # def post_init
#   #   super
#   #   no_environment_strings
#   # end
# 
#   def process_http_request
#     # the http request details are available via the following instance variables:
#     #   @http_protocol
#     #   @http_request_method
#     #   @http_cookie
#     #   @http_if_none_match
#     #   @http_content_type
#     #   @http_path_info
#     #   @http_request_uri
#     #   @http_query_string
#     #   @http_post_content
#     #   @http_headers
# 
#     response = EM::DelegatedHttpResponse.new(self)
#     response.status = 200
#     response.content_type 'text/html'
#     response.content = '<center><h1>Hi there</h1></center>'
#     response.send_response
#   end
# end 

EventMachine::run do
  host = '0.0.0.0'
  port = configatron.socket.port rescue 5000
  
  tracker = ClientTracker.new
  NodeConnection.tracker = tracker
  
  EventMachine.epoll if RUBY_PLATFORM =~ /linux/ #sky is the limit
  EventMachine::start_server host, port, ClientConnection, tracker
  # see comment on gem above
  # EventMachine::start_server host, 8000, MyHttpServer

  
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

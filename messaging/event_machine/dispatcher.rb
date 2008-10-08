#!/usr/bin/env ruby

require 'rubygems'
require 'eventmachine'

module EchoServer
  @@test = 0
  def receive_data(data)
    puts(data.to_s)
    send_data(data + ' -> ' + (@@test += 1).to_s + "\n" )
  end
end

EventMachine::run do
  host = '0.0.0.0'
  port = 8080
  EventMachine::start_server(host, port, EchoServer)
  puts "Started EchoServer on #{host}:#{port}..."
end


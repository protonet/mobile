#!/usr/bin/env ruby
require 'rubygems'
require 'eventmachine'
# require 'ruby-debug'
# Debugger.start

# simple echoserver, returns what you send him
module EchoServer
  
  @@test = 0
  
  def receive_data(data)
    answer = data + ' -> ' + (@@test += 1).to_s + "\n"
    puts("data: #{data}\nanswer:#{answer.to_s}")
    send_data(answer)
  end
  
end

EventMachine::run do
  host = '0.0.0.0'
  port = 5000
  EventMachine.epoll if RUBY_PLATFORM =~ /linux/ #sky is the limit
  EventMachine::start_server(host, port, EchoServer)
  puts "Started EchoServer on #{host}:#{port}..."
end

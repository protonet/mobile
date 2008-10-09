#!/usr/bin/env ruby

require 'rubygems'
require 'eventmachine'

module EchoServer
  @@test = 0
  @@policy_sent = false
  def receive_data(data)
    foo = <<-EOS
    <?xml version="1.0" encoding="UTF-8"?> 
    <cross-domain-policy xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.adobe.com/xml/schemas/PolicyFileSocket.xsd">
        <allow-access-from domain="*" to-ports="*" secure="false" />
        <site-control permitted-cross-domain-policies="master-only" />
    </cross-domain-policy>\0
    EOS
    answer = @@policy_sent ? (data + ' -> ' + (@@test += 1).to_s + "\n" ) : @@policy_sent = true && foo
    puts("data: #{data}\nanswer:#{answer.to_s}")
    send_data(answer)
  end
end

EventMachine::run do
  host = '0.0.0.0'
  port = 5000
  EventMachine::start_server(host, port, EchoServer)
  puts "Started EchoServer on #{host}:#{port}..."
end


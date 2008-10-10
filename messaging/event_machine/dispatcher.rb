#!/usr/bin/env ruby

require 'rubygems'
require 'eventmachine'

# should be requireable to include basic flash interaction functionality
# policy stuff for example ...
# aj: maybe some monkeypatching of the the receive data sutff
# also can include / require the modules class variables?
module FlashServer
  @policy_sent = false
  
  def receive_data(data)
    return send_swf_policy unless @policy_sent
  end
  
  # this is a flash security policy thing that needs to be sent on the first request to
  # this server
  def send_swf_policy
    policy = <<-EOS
    <?xml version="1.0" encoding="UTF-8"?> 
    <cross-domain-policy xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.adobe.com/xml/schemas/PolicyFileSocket.xsd">
        <allow-access-from domain="*" to-ports="*" secure="false" />
        <site-control permitted-cross-domain-policies="master-only" />
    </cross-domain-policy>\0
    EOS
     @policy_sent && send_data(policy)
  end
  
end

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
  EventMachine::start_server(host, port, EchoServer)
  puts "Started EchoServer on #{host}:#{port}..."
end


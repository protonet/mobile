#!/usr/bin/env ruby
require 'rubygems'
require 'eventmachine'
require 'ruby-debug'
Debugger.start

Gem.path.each do |path| 
  begin
    require path + "/gems/tmm1-amqp-0.5.9/lib/mq"
  rescue LoadError => e
    raise e if path == Gem.path.last
  end
end


# awesome stuff happening here
module JsDispatchingServer
  
  def post_init
    puts 'post-init'
    amq = MQ.new
    amq.queue('chat-messages').subscribe{ |msg|
      send_data('chat-message received' + msg)
    }
  end

end

EventMachine::run do
  host = '0.0.0.0'
  port = 5000
  EventMachine.epoll if RUBY_PLATFORM =~ /linux/ #sky is the limit
  EventMachine::start_server(host, port, JsDispatchingServer)
  puts "Started JsDispatchingServer on #{host}:#{port}..."
end

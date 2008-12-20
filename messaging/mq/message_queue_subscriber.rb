# simple test to see how a simple amqp queuing mechanism could work
require 'rubygems'

Gem.path.each do |path| 
  begin
    require path + "/gems/tmm1-amqp-0.5.9/lib/mq"
  rescue LoadError => e
    raise e if path == Gem.path.last
  end
end

EM.run{

  def log *args
    p [ Time.now, *args ]
  end
  
  amq = MQ.new
  amq.queue('chat-messages').subscribe{ |msg|
    log 'chat-message', :received, msg
  }

}

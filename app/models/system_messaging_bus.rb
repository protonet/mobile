class SystemMessagingBus

  class << self
    include Rabbit

    def queue(name)
      amqp.queue(name)
    end

    def topic(name)
      amqp.topic(name)
    end
    
    def fanout(name)
      amqp.fanout(name)
    end

    def active?
      rabbit_mq_running = false
      amqp.queue('testqueue').delete
      amqp.queue('testqueue').subscribe do |msg|
        rabbit_mq_running = true
      end
      amqp.queue('testqueue').publish('ping')
      sleep 1.5
      return rabbit_mq_running
    end
  
  end

end
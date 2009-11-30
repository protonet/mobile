module System
  class MessagingBus
  
    class << self
    
      def queue(name)
        @mq ||= MQ.new
        @mq.queue(name)
      end

      def topic(name) 
        @mq ||= MQ.new
        @mq.topic(name)
      end

      def active?
        @mq ||= MQ.new
        rabbit_mq_running = false
        @mq.queue('testqueue').subscribe{ |msg|
          rabbit_mq_running = true
        }
        @mq.queue('testqueue').publish('ping')
        sleep 1.5
        return rabbit_mq_running
      end
    
    end
  
  end
end
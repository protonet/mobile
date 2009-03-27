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
    
  end
  
end

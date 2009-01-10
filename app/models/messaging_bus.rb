class MessagingBus
  
  class << self
    
    def self.queue(name)
      @mq ||= MQ.new
      @mq.queue(name)
    end

    def self.topic(name) 
      @mq ||= MQ.new
      @mq.topic(name)
    end
    
  end
  
end

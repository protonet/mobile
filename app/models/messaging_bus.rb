class MessagingBus
  
  def self.queue(name)
    @mq ||= MQ.new
    @mq.queue(name)
  end
  
end

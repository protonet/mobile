class MessagingBus
  
  def self.queue(name)
    # in case you were wondering, this doesn't work
    @mq ||= MQ.new
    @mq.queue(name)
  end
  
end

module RabbitMQ
  def amq;    @amq ||= MQ.new; end
  def queues; @queues ||= [];  end
  
  def bind topic, *keys, &handler
    key = "#{topic}.#{keys.join('.')}"
    
    queue = amq.queue "#{queue_id}.#{key}", :auto_delete => true
    queue.bind(amq.topic(topic), :key => key).subscribe do |packet|
      log "Received rabbitmq packet from #{key}"
      begin
        handler.call JSON.parse(packet)
      rescue JSON::ParserError
        log "JSON parsing error from rabbitmq packet"
      end
    end
    
    queues << queue
    queue
  end

  def publish topic, key, data
    key = key.join('.') if key.is_a? Array
    log "Publishing rabbitmq packet to #{topic}.#{key}"
    amq.topic(topic).publish data.to_json, :key => "#{topic}.#{key}"
  end
  
  def unbind_queues
    queues.each {|q| q.unsubscribe }
  end
  
  def queue_id
    "#{self.class}-#{self.object_id}"
  end
end

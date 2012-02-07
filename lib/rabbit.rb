# Module to make using AMQ prettier
# Author: Daniel Danopia

module Rabbit
  
  def amqp
    @amqp ||= begin
      connection = AMQP.connect(:vhost => configatron.amqp.vhost)
      AMQP::Channel.new(connection)
    end
  end
  
  def queues
    @queues ||= []
  end
  
  def bind topic, *keys, &handler
    key = "#{topic}.#{keys.join('.')}"
    
    queue = amqp.queue "#{queue_id}.#{key}", :auto_delete => true
    queue.bind(amqp.topic(topic), :key => key).subscribe do |packet|
      log "Received rabbitmq packet from #{key}" if $DEBUG==1
      begin
        handler.call JSON.parse(packet)
      rescue JSON::ParserError
        log "JSON parsing error from rabbitmq packet" if $DEBUG==1
      end
    end
    
    queues << queue
    queue
  end

  def publish topic, key, data
    key = key.join('.') if key.is_a? Array
    log "Publishing rabbitmq packet to #{topic}.#{key}" if $DEBUG==1
    amqp.topic(topic).publish data.to_json, :key => "#{topic}.#{key}"
  end
  
  def unbind_queues
    queues.each {|q| q.unsubscribe }
  end
  
  def queue_id
    "#{self.class}-#{self.object_id}"
  end
end

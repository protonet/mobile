# Module to make using AMQ prettier
# Author: Daniel Lamando

module Rabbit
  def amq;    @amq ||= MQ.new; end
  def queues; @queues ||= [];  end
  
  def _log message
    puts message #if $DEBUG
  end
  
  def bind topic, *keys, &handler
    keys.unshift(topic)
    key = keys.join('.')
    
    queue = amq.queue "#{queue_id}.#{key}", :auto_delete => true
    queue.bind(amq.topic(topic), :key => key).subscribe do |packet|
      _log "Received rabbitmq packet from #{key}"
      begin
        handler.call JSON.parse(packet)
      rescue JSON::ParserError
        _log "JSON parsing error from rabbitmq packet"
      end
    end
    
    queues << queue
    queue
  end

  def publish topic, keys, data
    keys = [keys] unless keys.is_a? Array
    keys.unshift(topic)
    key = keys.join('.')
    _log "Publishing rabbitmq packet to #{key}"
    amq.topic(topic).publish data.to_json, :key => key
  end
  
  def unbind_queues
    queues.each {|q| q.unsubscribe }
  end
  
  def queue_id
    "#{self.class}-#{self.object_id}"
  end
end

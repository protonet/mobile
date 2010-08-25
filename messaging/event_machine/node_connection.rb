require 'uri'

require File.join(File.dirname(__FILE__), 'flash_connection')

class NodeConnection < FlashConnection
  attr_accessor :network
  
  def self.connect network
    uri = URI.parse network.supernode
    
    EventMachine.next_tick do
      EventMachine.connect uri.host, 5000, NodeConnection, network
    end
  end
  
  def initialize network
    super()
    
    @network = network
  end
  
  def post_init
    log "connected to remote network ##{@network.id}"
    
    bind_channel Channel.find_by_id(23)
    
    send_json :operation => 'authenticate', :payload => {:type => 'node', :node_uuid => 2}
  rescue => ex
    p ex, ex.backtrace
  end
  
  def receive_json json
    log "Received JSON: #{json.inspect}"
    
    if json['x_target'] == 'protonet.globals.communicationConsole.receiveMessage' then
      publish 'channels', "channels.#{json['channel_uuid']}", json.to_json
    end
  end
  
  def bind_channel channel
    log "bound to #{channel.id}"
    amq = MQ.new
    queue = amq.queue("node-#{@network.key}-channel.#{channel.id}", :auto_delete => true)
    queue.bind(amq.topic("channels"), :key => "channels.#{channel.uuid}").subscribe do |msg|
      message = JSON.parse(msg)
      # remote servers won't take messages over sockets yet
      #send_json message
    end
  end

  def publish topic, key, data
    MQ.new.topic(topic).publish(data, :key => key)
  end

  def to_s
    "node connection #{@network.key || 'uncoupled'}"
  end
end

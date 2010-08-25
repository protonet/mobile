require 'uri'

require File.join(File.dirname(__FILE__), 'flash_connection')
require File.dirname(__FILE__) + '/modules/rabbitmq.rb'

class NodeConnection < FlashConnection
  include RabbitMQ
  
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
      json['channel_id'] = Channel.find_by_uuid(json['channel_uuid']).id
      publish 'channels', json['channel_uuid'], json
    end
  end
  
  def bind_channel channel
    bind 'channels', channel.uuid do |json|
      # remote nodes won't take messages over sockets yet
      #send_json message
    end
    log "bound to #{channel.id}"
  end

  def queue_id; "node-#{@network.key}"; end
  def to_s; "node connection #{@network.key || 'uncoupled'}"; end
end

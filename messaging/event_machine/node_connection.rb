require 'uri'

require File.join(File.dirname(__FILE__), 'flash_connection')
require File.dirname(__FILE__) + '/modules/rabbitmq.rb'

class NodeConnection < FlashConnection
  include RabbitMQ
  
  attr_accessor :network
  
  def self.connect(network)
    uri = URI.parse network.supernode
    
    EventMachine.next_tick do
      conn = EventMachine.connect uri.host, 5000, NodeConnection, network
      
      EventMachine.add_periodic_timer 30 do
        conn.send_json :operation => 'ping'
      end
    end
  end
  
  def initialize(network)
    super()
    
    @network = network
  end
  
  def post_init
    log "connected to remote network ##{@network.uuid}"
    
    Channel.global.each do |chan|
      bind_channel chan
    end
    
    send_json :operation => 'authenticate', :payload => {:type => 'node', :node_uuid => Network.find(1).uuid}
  rescue => ex
    p ex, ex.backtrace
  end
  
  def unbind
    @network.coupled = false
    @network.save
  end
  
  def receive_json(json)
    log "Received JSON: #{json.inspect}"
    
    if json['x_target'] == 'protonet.globals.communicationConsole.receiveMessage' then
      # TODO: when using node UUIDs, this check needs to be against the current node I think
      return if json['network_uuid'] == Network.find(1).uuid
      
      channel = Channel.find_by_uuid(json['channel_uuid'])
      json['channel_id'] = channel.id
      json['network_uuid'] = @network.uuid
      
      tweet = Tweet.create :user_id => 0,
        :author => json['author'],
        :message => json['message'],
        :text_extension => json['text_extension'],
        :network_id => @network.id,
        :channels => [channel]
      
      publish 'channels', json['channel_uuid'], json
    end
  end
  
  def bind_channel(channel)
    bind('channels', channel.uuid) do |json|
      if json['network_uuid'] == Network.find(1).uuid
        json['operation'] = 'tweet'
        send_json json
      end
    end
    log "bound to #{channel.id}"
  end

  def queue_id
    "node-#{@network.key}"
  end
  
  def to_s 
    "node connection #{@network.key || 'uncoupled'}"
  end
  
end

require 'uri'

class NodeConnection < EventMachine::Connection
  attr_accessor :network
  
  def self.connect network
    uri = URI.parse network.supernode
    
    EventMachine.next_tick do
      EventMachine.connect uri.host, 5000, NodeConnection, network
    end
  end
  
  def initialize network
    @network = network
    @buffer = ''
    
    set_comm_inactivity_timeout 60
  end
  
  def post_init
    log "connected to remote network ##{@network.id}"
    
    bind_channel Channel.find_by_id(23)
    
    send_json :operation => 'authenticate', :payload => {:type => 'node', :node_uuid => 2}
  end
  
  def receive_json json
    p json
    
    if json['x_target'] == 'protonet.globals.communicationConsole.receiveMessage' then
      publish 'channels', "channels.#{json['channel_uuid']}", json.to_json
    end
  end
  
  def send_json json
    send_data json.to_json + "\0"
  end
  
  def receive_data data
    @buffer += data
    
    while @buffer.include? "\0"
      packet = @buffer[0, @buffer.index("\0")]
      @buffer = @buffer[(@buffer.index("\0")+1)..-1]
      
      begin
        receive_json JSON.parse(packet)
      rescue JSON::ParserError
        log "JSON parsing error"
      end
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

  def log text
    puts "node connection #{@network.key || 'uncoupled'}: #{text}" # if $DEBUG
  end
end

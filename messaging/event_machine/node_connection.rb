require 'uri'

require File.join(File.dirname(__FILE__), 'flash_connection')

# TODO: move the non-instance stuff out of this ugly mess

class NodeConnection < FlashConnection
  include Rabbit
  
  class << self
    include Rabbit
    
    def log message
      puts message
    end
    
    def tracker= tracker
      @tracker = tracker
  
      bind 'networks', 'couple' do |json|
        connect Network.find(json['network_id']), @tracker, json['server_host'], json['server_port']
      end
    end
  end
  
  attr_accessor :network, :tracker
  
  def self.negotiate(network, tracker)
    EventMachine.defer do
      network.couple
    end
  end
  
  def self.connect(network, tracker, host=nil, port=nil)
    uri = URI.parse network.supernode
    
    host ||= uri.host
    port ||= 5000
    
    EventMachine.next_tick do
      conn = EventMachine.connect host, port, NodeConnection, network, tracker
      
      EventMachine.add_periodic_timer 30 do
        conn.send_json :operation => 'ping'
      end
    end
  end
  
  def initialize(network, tracker)
    super()
    
    @network = network
    @tracker = tracker
  end
  
  def post_init
    log "connected to remote network #{@network.uuid}"
    
    Channel.global.each do |chan|
      bind_channel chan
    end
    
    # TODO: :node_uuid => :uuid, and send :key
    send_json :operation => 'authenticate',
              :payload => {:type => 'node', :node_uuid => Network.find(1).uuid},
              :channels => Channel.all(:conditions => {:network_id => @network.id}).map(&:uuid)
  rescue => ex
    p ex, ex.backtrace
  end
  
  def unbind
    #@network.coupled = false
    #@network.save
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
      
    elsif json['trigger'] == 'user.update_online_states' then
      @tracker.update_remote_users json['online_users']
      
      # TODO: abstract this out
      publish 'system', 'users',
        :x_target => "protonet.Notifications.triggerFromSocket",
        :online_users => @tracker.global_users,
        :trigger => 'user.update_online_states'
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

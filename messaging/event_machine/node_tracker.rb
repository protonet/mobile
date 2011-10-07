class NodeTracker
  include Rabbit
  attr_accessor :online_nodes, :open_sockets, :client_tracker
  
  def initialize(client_tracker)
    @client_tracker  = client_tracker
    @online_nodes  = Hash.new {|hash, key| hash[key] = {} }
    @open_sockets  = []
  end
  
  def bind_nodes_queue
    bind 'nodes', "#" do |json|
      puts "\n\n\n GOT NODE message #{json.inspect}\n\n\n"
      case json['trigger']
      when 'node.coupled'
        NodeConnection.connect(Node.find(json['node_id']), self)
      when 'node.channel_attached'
        @online_nodes[json['node_uuid']].bind_channel(Channel.find(json['channel_id'])) rescue nil
      end
    end
  end
  
  def add_conn(conn)
    @open_sockets << conn
  end

  def remove_conn(conn)
    @open_sockets.reject! {|s| s == conn }
  end
  
  def add_node(node, conn)
    add_conn(conn)
    @online_nodes[node.uuid] = conn
  end
  def remove_node(node)
    remove_conn(@online_nodes[node.uuid])
    @online_nodes.delete(node.uuid)
  end
  
end

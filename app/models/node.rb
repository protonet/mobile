class Node < ActiveRecord::Base
  include Rabbit
  
  belongs_to :network
  has_many :users
  has_many :channels
  has_many :meeps
  
  after_create  :generate_uuid, :if => lambda {|n| n.uuid.blank? }
  
  scope :remote, :conditions => 'nodes.id != 1'
  
  class << self
    
    def team
      from_url("https://team.protonet.info")
    end
    
    def couple(node_data)
      unless node = find_by_uuid(node_data[:uuid])
        node = from_url(node_data[:url])
        node.save
      end
      node if node.couple
    end
    
    def local
      begin
        find(1)
      rescue ActiveRecord::RecordNotFound
        node = new(:name => "local", :description => "default description, change me!", :url => "http://127.0.0.1", :network_id => 1)
        node.id = 1
        node.save
        node.reload
      end
    end
    
    def from_url(url)
      protonet = Protolink::Protonet.open(url)
      node_data = protonet.node
      return find_by_uuid(node_data.uuid) || begin
        node = new
        node.url  = url
        node.uuid = node_data.uuid
        node.name = node_data.name
        node.description = node_data.description
        node
      end
    end
    
    def with_channels
      all.select {|n| n.channels.real.size > 0 }
    end
    
  end
  
  def local?
    id == 1
  end
  
  def couple_data
    # {:name => name, :description => description, :uuid => uuid, :url => url}
    attributes
  end
  
  def couple
    coupled? || begin
      remote_node = Protolink::Protonet.open(url)
      user, password    = remote_node.couple(Node.local.couple_data)
      self.api_user_id  = user.id
      self.api_user     = user.login
      self.api_password = password
      save && send_couple_message
      self
    end
  end
  
  def coupled?
    return unless api_user && api_password
    remote_api.node.coupled?
  end
  
  def generate_user
    username = "api_#{name}_#{id}"
    password = ActiveSupport::SecureRandom.base64(10)
    # retrieve user if it exists
    user = User.find_or_create_by_login("api_#{name}_#{id}") do |user|
      user.email = "#{username}@node2node.fakeemail"
      user.channels_to_subscribe = []
      user.node = self
    end
    # always set a new password
    user.password = password
    user.save
    # always set the right role
    user.roles = [Role.find_by_title("api-node")]
    [user, password]
  end
  
  def global_channels
    protonet = Protolink::Protonet.open(url)
    protonet.global_channels || []
  end
  
  def attach_global_channel(uuid)
    raise(RuntimeError, "A channel is obviously not global if it's a local one, eh?") if local?
    remote_node = remote_api
    remote_channel = remote_node.find_channel_by_uuid(uuid)
    if remote_node.create_listen(api_user_id, remote_channel.id)
      channel = Channel.find_or_create_by_uuid(remote_channel.uuid) do |c|
        c.node = self
        c.name = remote_channel.name
        c.description = remote_channel.description
        c.owner_id = -1
      end
      send_attach_global_channel_message(channel) if channel
      channel
    end
  end
  
  def remote_api
    @remote_api ||= Protolink::Protonet.open(url, api_user, api_password)
  end
  
  def generate_uuid
    raise RuntimeError if uuid
    self.update_attribute(:uuid, UUID4R::uuid(1))
  end
  
  def send_couple_message
    publish 'nodes', 'couple',
      :trigger           => 'node.coupled',
      :node_id           => id,
      :node_uuid         => uuid,
      :node_name         => name,
      :node_description  => description
  end
  
  def send_attach_global_channel_message(channel)
    publish 'nodes', ['attach', 'channel'],
      :trigger        => 'node.channel_attached',
      :node_id        => id,
      :node_uuid      => uuid,
      :channel_id     => channel.id,
      :channel_uuid   => channel.uuid
  end
  
end

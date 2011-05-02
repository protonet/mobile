class Network < ActiveRecord::Base
  include Rabbit
  
  has_many :channels
  has_many :tweets
  
  validates_uniqueness_of :uuid
  after_create :generate_uuid, :if => lambda {|c| c.uuid.blank? && c.local? }
  
  def self.local
    begin
      find(1)
    rescue ActiveRecord::RecordNotFound
      network = new(:id => 1)
      network.save && update_all("id = 1", "id = #{network.id}")
      update_local_from_preferences
      find(1)
    end
  end
  
  def self.update_local_from_preferences
    local.update_attributes({:name => SystemPreferences.node_name, :description => SystemPreferences.node_description, :key => SystemPreferences.node_key, :supernode => SystemPreferences.node_supernode, :uuid => SystemPreferences.node_uuid})
  end
  
  def local?
    id == 1
  end
  
  def coupled?
    coupled
  end
  
  def negotiate post=true
    return do_get '/networks/negotiate.json' unless post
    
    fields = {:key => self.key}
  
    # stupid rails
    Network.local.attributes.each_pair do |key, val|
      fields["network[#{key}]"] = val
    end
    
    res = do_post '/networks/negotiate.json', fields
    update_attributes :key => res['key'], :uuid => res['node']['uuid'] # saves
    res
  end
  
  def couple
    res = negotiate
    
    publish 'networks', 'couple',
      :network_id => self.id,
      :server_host => res['config']['socket_server_host'],
      :server_port => res['config']['socket_server_port']
  end
  
  def decouple
    publish 'networks', 'decouple',
      :network_id => self.id
  end
  
  def generate_key
    self.key = ActiveSupport::SecureRandom.base64 32
  end

  def generate_uuid
    raise RuntimeError if uuid
    self.update_attribute(:uuid, UUID4R::uuid(1))
  end
  
  def get_channels
    do_get('/networks/negotiate.json')['channels']
  end
  
  # Only use to GET JSON data.
  def do_get path, json=true
    do_http Net::HTTP::Get, path, json
  end
  
  # Only use to POST forms (and return JSON data).
  def do_post path, data, json=true
    do_http Net::HTTP::Post, path, json do |req|
      req.set_form_data data
    end
  end
  
  # Only use to POST forms (and return JSON data).
  def do_http klass, path, json=true, &blk
    uri = URI.parse supernode
    
    Net::HTTP.start(uri.host, uri.port) do |http|
      req = klass.new path
      req.basic_auth uri.user, uri.password if uri.userinfo
      blk.call req if blk
      response = http.request(req)
      
      json ? JSON.parse(response.body) : response.body
    end
  end
end

class Network < ActiveRecord::Base
  has_many :channels
  has_many :tweets
  
  validates_uniqueness_of :uuid
  after_create :generate_uuid, :if => lambda {|c| c.uuid.blank? && local? }
  
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
    self.attributes.each_pair do |key, val|
      fields["network[#{key}]"] = val
    end
    
    res = do_post '/networks/negotiate.json', fields
    update_attributes :key => res['key'] # saves
    res
  end
  
  def couple
    res = negotiate
    
    System::MessagingBus.topic('networks').publish({
      :network_id => self.id,
      :server_host => res['config']['socket_server_host'],
      :server_port => res['config']['socket_server_port']
    }.to_json, :key => 'networks.couple')
  end
  
  def decouple
    System::MessagingBus.topic('networks').publish({
      :network_id => self.id
    }.to_json, :key => 'networks.decouple')
  end
  
  def generate_key
    self.key = ActiveSupport::SecureRandom.base64 32
  end

  def generate_uuid
    raise RuntimeError if uuid
    self.update_attribute(:uuid, UUID.create.to_s)
  end
  
  def get_channels
    do_get('/networks/negotiate.json')['channels'] # remote URL needs to be better somehow
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

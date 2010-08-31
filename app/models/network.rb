class Network < ActiveRecord::Base
  has_many :channels
  has_many :tweets
  
  validates_uniqueness_of :uuid
  after_create  :generate_uuid,   :if => lambda {|c| c.uuid.blank? }
  
  def local?
    id == 1
  end
  
  def coupled?
    coupled
  end
  
  def couple
    response = do_get '/networks/1/join'
    self.key = response['key']
    channels = response['channels']
    channels.each do |channel|
      Channel.new(channel.merge({:network_id => self.id, :owner_id => 0})).save
    end
    save
  end
  
  def decouple
    
  end
  
  def get_channels
    do_get('/networks/1/channels')['channels'] # remote URL needs to be better somehow
  end
  
  # Only use to GET JSON data.
  def do_get path
    uri = URI.parse supernode
    
    Net::HTTP.start(uri.host, uri.port) do |http|
      req = Net::HTTP::Get.new path
      req.basic_auth uri.user, uri.password if uri.userinfo
      response = http.request(req)
      
      JSON.parse response.body
    end
  end

  def generate_uuid
    raise RuntimeError if uuid
    self.update_attribute(:uuid, UUID.create.to_s)
  end
  
end

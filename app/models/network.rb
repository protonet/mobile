class Network < ActiveRecord::Base
  has_many :channels
  has_many :tweets
  
  validates_uniqueness_of :uuid
  after_create  :generate_uuid,   :if => lambda {|c| c.uuid.blank? }
  
  def local?
    id == 1
  end
  
  def coupled?
    false
  end
  
  def couple
    response = Net::HTTP.get(URI.parse("#{supernode}/networks/1/join"))
    response = JSON.parse(response)
    self.key = response['key']
    channels = response['channels']
    channels.each do |channel|
      Channel.new(channel.merge({:network_id => self.id, :owner_id => 0})).save
    end
    save
  end
  
  def decouple
    
  end
  
  # TODO: abstract into doRequest (for authing)
  def get_channels
    uri = URI.parse supernode
    
    Net::HTTP.start(uri.host, uri.port) do |http|
      req = Net::HTTP::Get.new '/networks/1/join'
      req.basic_auth uri.user, uri.password if uri.userinfo
      response = http.request(req)
      
      response = JSON.parse(response.body)
      response['channels']
    end
  end

  def generate_uuid
    raise RuntimeError if uuid
    self.update_attribute(:uuid, UUID.create.to_s)
  end
  
end

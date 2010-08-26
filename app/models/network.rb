class Network < ActiveRecord::Base
  has_many :channels
  has_many :tweets
  
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
  
  def get_channels
    
  end
  
end

class Network < ActiveRecord::Base
  has_many :channels
  
  def local?
    id == 1
  end
  
  def coupled?
    false
  end
  
  def couple
    response = Net::HTTP.get_print(supernode, '/networks/1/join')
    
  end
  
  def decouple
    
  end
  
  def get_channels
    
  end
  
end

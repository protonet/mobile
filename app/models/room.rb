class Room
  include DataMapper::Resource
  
  property :id,                         Integer,  :serial => true
  property :user_id,                    Integer
  property :name,                       String
  
  property :open,                       Boolean, :default => true
  property :hidden,                     Boolean, :default => false

  has n, :messages
  
  def self.lobby
    get(1)
  end

end

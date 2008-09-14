class Room
  include DataMapper::Resource
  
  property :id,                         Integer,  :serial => true
  property :user_id,                    Integer
  property :name,                       String
  
  property :open,                       Boolean, :default => true
  property :hidden,                     Boolean, :default => false

  has n, :chat_messages
  
  def self.lobby
    get(1) || new(:id => 1, :user_id => 0, :name => 'Lobby').save && get(1)
  end

end

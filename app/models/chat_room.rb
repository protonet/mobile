class ChatRoom
  include DataMapper::Resource
  
  property :id,                         Integer,  :serial => true
  property :user_id,                    Integer
  property :name,                       String
  
  property :open,                       Boolean, :default => true
  property :hidden,                     Boolean, :default => false

  belongs_to :owner, :class_name => "User"
  has n, :chat_room_users
  has n, :users,    :through => :chat_room_users, :remote_name => :users, :class_name => "User", :child_key => "chat_room_id", :mutable => true
  has n, :messages, :class_name => ChatMessage
  
  def self.lobby
    get(1) || new(:id => 1, :user_id => 0, :name => 'Lobby').save && get(1)
  end

end

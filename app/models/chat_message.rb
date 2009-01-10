class ChatMessage
  include DataMapper::Resource

  # before :save, :sanitize
  after :create, :send_to_queue

  property :id,                         Integer,  :serial => true
  property :chat_room_id,               Integer
  property :user_id,                    Integer
  property :text,                       String

  belongs_to :room, :class_name => 'ChatRoom'
  belongs_to :user
  
  def to_json
    self.attributes.to_json
  end
  
  def send_to_queue
    MessagingBus.topic('chats').publish(self.to_json, :key => 'chats.r' + chat_room_id.to_s)
  end

end

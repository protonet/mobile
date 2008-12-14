class ChatMessage
  include DataMapper::Resource

  # before :save, :sanitize

  property :id,                         Integer,  :serial => true
  property :chat_room_id,               Integer
  property :user_id,                    Integer
  property :text,                       String

  belongs_to :room, :class_name => 'ChatRoom'
  belongs_to :user
  
  def to_json
    self.attributes.to_json
  end

end

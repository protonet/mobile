class ChatMessage
  include DataMapper::Resource

  property :id,                         Integer,  :serial => true
  property :room_id,                    Integer
  property :user_id,                    Integer
  property :message,                    String

  belongs_to :room
  belongs_to :user

end

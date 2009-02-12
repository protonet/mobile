class ChatRoomUser
  include DataMapper::Resource

  property :id,                         Integer, :serial => true
  property :user_id,                    Integer
  property :chat_room_id,               Integer

  belongs_to :user
  belongs_to :chat_room

end

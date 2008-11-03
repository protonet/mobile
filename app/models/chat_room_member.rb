class ChatRoomMember
  include DataMapper::Resource

  property :id,                         Integer,  :serial => true
  property :user_id,                    Integer
  property :room_id,                    Integer

end

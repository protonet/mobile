class Message
  include DataMapper::Resource

  property :id,                         Integer,  :serial => true
  property :room_id,                    Integer
  property :user_id,                    Integer
  property :message,                    String


end

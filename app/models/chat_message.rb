class ChatMessage
  include DataMapper::Resource

  # before :save, :sanitize

  property :id,                         Integer,  :serial => true
  property :room_id,                    Integer
  property :user_id,                    Integer
  property :text,                       String

  belongs_to :room
  belongs_to :user
  
  def to_json
    self.attributes.to_json
  end

end

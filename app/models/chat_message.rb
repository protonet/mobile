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
    # this doesn't work
    # MessagingBus.queue('chat-messages').publish(self.to_json)
    
    # this however does ;)
    EM.run{
      amq = MQ.new
      amq.queue('chat-messages').publish(self.to_json)
    }
  end

end

class Tweet < ActiveRecord::Base
  
  belongs_to  :user
  has_many    :says
  has_many    :audiences, :through => :says
  
  named_scope :recent, :order => "tweets.id DESC"
  
  # validate_existence_of :audience
  
  after_create :send_to_queue
  
  def send_to_queue
    audiences.each do |audience|
      p "=================================>>>>>>>>>>>>>>>>>>>>>>>>>>> send_to_queue"
      MessagingBus.topic('audiences').publish(self.to_json, :key => 'audiences.a' + audience.id.to_s)
    end
  end
  
  
end

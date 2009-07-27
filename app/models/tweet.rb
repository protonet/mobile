class Tweet < ActiveRecord::Base
  
  belongs_to  :user
  has_many    :says
  has_many    :audiences, :through => :says
  
  named_scope :recent, :order => "tweets.id DESC"
  
  attr_accessor :socket_id
  # validate_existence_of :audience
  
  after_create :send_to_queue if configatron.messaging_bus_active
  
  def send_to_queue
    audiences.each do |audience|
      RAILS_DEFAULT_LOGGER.info("=================================>>>>>>>>>>>>>>>>>>>>>>>>>>> send_to_queues: #{audiences.collect {|a| a.id}.join(' ')}")
      MessagingBus.topic('audiences').publish(elf.attributes.merge({:socket_id => socket_id, :audience_id => audience.id, :user_icon_url => user.active_avatar_url}).to_json, :key => 'audiences.a' + audience.id.to_s)
    end
  end
end

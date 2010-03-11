class Tweet < ActiveRecord::Base
  
  belongs_to  :user
  has_many    :says
  has_many    :channels, :through => :says
  
  named_scope :recent, :order => "tweets.id DESC"
  
  attr_accessor :socket_id
  # validate_existence_of :channel
  
  after_create :send_to_queue if configatron.messaging_bus_active == true
  
  def text_extension?
    !text_extension.blank?
  end
  
  def send_to_queue
    channels.each do |channel|
      RAILS_DEFAULT_LOGGER.info("=================================>>>>>>>>>>>>>>>>>>>>>>>>>>> send_to_queues: #{channels.collect {|a| a.id}.join(' ')}")
      System::MessagingBus.topic('channels').publish(self.attributes.merge({:socket_id => socket_id, :channel_id => channel.id, :user_icon_url => user.active_avatar_url}).to_json, :key => 'channels.a' + channel.id.to_s)
    end
  end
end

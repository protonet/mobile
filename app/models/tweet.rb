class Tweet < ActiveRecord::Base
  
  belongs_to  :user
  has_many    :says
  has_many    :channels,  :through => :says
  has_one     :avatar,    :through => :user
  
  named_scope :recent, :order => "tweets.id DESC"
  validates_presence_of :message
  
  attr_accessor :socket_id
  # validate_existence_of :channel
  
  after_create :send_to_queue if Rails.env == 'production' || configatron.messaging_bus_active == true
  
  def text_extension?
    !text_extension.blank?
  end
  
  def send_to_queue
    channels.each do |channel|
      System::MessagingBus.topic('channels').publish(self.attributes.merge({
        :socket_id => socket_id,
        :channel_id => channel.id,
        :channel_uuid => channel.uuid,
        :user_icon_url => user.active_avatar_url
        }).to_json, :key => 'channels.' + channel.uuid)
    end
  end
  
end

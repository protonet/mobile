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
  
  def send_to_queue
    self.text_extension = JSON.parse(text_extension) rescue nil
    channels.each do |channel|
      System::MessagingBus.topic('channels').publish(self.attributes.merge({
        :socket_id      => socket_id,
        :channel_id     => channel.id,
        :avatar         => user.active_avatar_url,
        :trigger        => 'meep.receive'
      }).to_json, :key => 'channels.' + channel.id.to_s)
    end
  end
  
  def self.prepare_for_frontend(channel, meeps)
    meeps.map do |m|
      m.text_extension = JSON.parse(m.text_extension) rescue nil
      m.attributes.merge({ :avatar => m.user.active_avatar_url, :channel_id => channel.id })
    end
  end
  
  def self.valid_attributes
    column_names + ['socket_id']
  end
  
end

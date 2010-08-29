class Tweet < ActiveRecord::Base

  searchable do
    integer :channel_ids, :references => Channel, :multiple => true
    text :message, :stored => true
    text :text_extension
    time :created_at
    time :updated_at
  end

  belongs_to  :network
  belongs_to  :user
  has_many    :says
  has_many    :channels,  :through => :says
  has_one     :avatar,    :through => :user

  named_scope :recent, :order => "tweets.id DESC"
  validates_presence_of :message

  attr_accessor :socket_id
  # validate_existence_of :channel

  def local?;  network_id == 1; end
  def remote?; network_id != 1; end

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
        :user_icon_url => user.active_avatar_url,
        :network_uuid => network.uuid
        }).to_json, :key => 'channels.' + channel.uuid)
    end
  end

  def from_minutes_before(mins, channel_id)
    from_minutes({
      :user_id    => user_id,
      :from       => (created_at - (mins + 1).minutes),
      :to         => created_at,
      :tweet_id   => id,
      :channel_id => channel_id
    })
  end

  def from_minutes_after(mins, channel_id)
    from_minutes({
      :user_id    => user_id,
      :from       => created_at,
      :to         => (created_at + (mins + 1).minutes),
      :tweet_id   => id,
      :channel_id => channel_id
    })
  end

  private

  def from_minutes(opts)
    Tweet.all(:include => [:says],
      :conditions => ["user_id = ? AND tweets.created_at >= ? AND tweets.created_at <= ? AND tweets.id <> ? AND says.channel_id = ?",
      opts[:user_id], opts[:from],opts[:to], opts[:tweet_id], opts[:channel_id]],
      :order => 'tweets.created_at DESC'
    )
  end
end


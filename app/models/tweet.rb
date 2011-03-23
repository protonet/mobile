class Tweet < ActiveRecord::Base
  include Rabbit

  SEARCH_RESULTS_PER_PAGE = 10

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

  scope :recent, :order => "tweets.id DESC"
  validates_presence_of :message

  attr_accessor :socket_id
  
  after_create :send_to_queue

  def local?
    network_id == 1
  end

  def remote?
    network_id != 1
  end

  def text_extension?
    !text_extension.blank?
  end

  def send_to_queue
    self.text_extension = JSON.parse(text_extension) rescue nil
    channels.each do |channel|
      publish 'channels', channel.uuid, self.attributes.merge({
        :socket_id    => socket_id,
        :channel_id   => channel.id,
        :channel_uuid => channel.uuid,
        :avatar       => user.avatar.url,
        :network_uuid => network.uuid,
        :trigger      => 'meep.receive'
      })
    end
  end

  def self.prepare_for_frontend(meeps, additional_attributes)
    meeps.map do |m|
      m.text_extension = JSON.parse(m.text_extension) rescue nil
      m.attributes.merge({ :avatar => m.user.avatar.url }).merge(additional_attributes || {})
    end
  end
  
  def self.valid_attributes
    column_names + ['socket_id']
  end

  def from_minutes_before(mins, channel_id)
    from_minutes({
      :from       => (created_at - (mins + 1).minutes),
      :to         => created_at,
      :tweet_id   => id,
      :channel_id => channel_id
    })
  end

  def from_minutes_after(mins, channel_id)
    from_minutes({
      :from       => created_at,
      :to         => (created_at + (mins + 1).minutes),
      :tweet_id   => id,
      :channel_id => channel_id
    })
  end
  
  def before(count)
    Tweet.all(:include => [:says],
      :conditions => ["tweets.id < ? AND says.channel_id = ?", id, channels.first.id],
      :order => "tweets.created_at DESC",
      :limit => count
    ).reverse
  end
  
  
  def after(count)
    Tweet.all(:include => [:says],
      :conditions => ["tweets.id > ? AND says.channel_id = ?", id, channels.first.id],
      :limit => count
    )
  end
  
  private

  def from_minutes(opts)
    Tweet.all(:include => [:says],
      :conditions => ["tweets.created_at >= ? AND tweets.created_at <= ? AND tweets.id <> ? AND says.channel_id = ?",
      opts[:from],opts[:to], opts[:tweet_id], opts[:channel_id]],
      :order => 'tweets.created_at DESC'
    )
  end
end


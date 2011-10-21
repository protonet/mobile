class Meep < ActiveRecord::Base
  include Rabbit

  SEARCH_RESULTS_PER_PAGE = 10

  searchable do
    integer :channel_id, :references => Channel, :multiple => true
    text :author
    text :message, :stored => true
    text :text_extension
    time :created_at
    time :updated_at
  end

  belongs_to  :node
  belongs_to  :user
  belongs_to  :channel

  scope :recent, :order => "meeps.id DESC"
  validates_presence_of :message, :unless => Proc.new { |meep| meep.text_extension? }

  attr_accessor :socket_id
  
  before_create :set_avatar
  after_create :send_to_queue
  
  def self.prepare_for_frontend(meeps, additional_attributes = {})
    meeps.map do |m|
      m.text_extension = JSON.parse(m.text_extension) rescue nil
      m.attributes.merge(additional_attributes)
    end
  end
  
  def self.valid_attributes
    column_names + ['socket_id']
  end
  
  def local?
    node_id == 1
  end

  def remote?
    node_id != 1
  end

  def text_extension?
    !text_extension.blank?
  end

  def send_to_queue
    self.text_extension = JSON.parse(text_extension) rescue nil
    data = self.attributes.merge({
      :socket_id      => socket_id,
      :channel_id     => channel.id,
      :channel_uuid   => channel.uuid,
      :node_uuid      => node.uuid,
      :trigger        => 'meep.receive'
    })
    if remote_user_id
      data[:user_id] = remote_user_id
      data[:local_user_id] = user_id
    end
    publish 'channels', channel.uuid, data
  end

  def from_minutes_before(mins, channel_id)
    from_minutes({
      :from       => (created_at - (mins + 1).minutes),
      :to         => created_at,
      :meep_id   => id,
      :channel_id => channel_id
    })
  end

  def from_minutes_after(mins, channel_id)
    from_minutes({
      :from       => created_at,
      :to         => (created_at + (mins + 1).minutes),
      :meep_id   => id,
      :channel_id => channel_id
    })
  end
  
  def before(count)
    Meep.all(
      :include => :user,
      :conditions => ["meeps.id < ? AND meeps.channel_id = ?", id, channel.id],
      :order => "meeps.created_at DESC",
      :limit => count
    ).reverse
  end
  
  
  def after(count)
    Meep.all(
      :include => :user,
      :conditions => ["meeps.id > ? AND meeps.channel_id = ?", id, channel.id],
      :limit => count
    )
  end
  
  private

  def from_minutes(opts)
    Meep.all(
      :conditions => ["meeps.created_at >= ? AND meeps.created_at <= ? AND meeps.id <> ? AND meeps.channel_id = ?",
      opts[:from],opts[:to], opts[:meep_id], opts[:channel_id]],
      :order => 'meeps.created_at DESC'
    )
  end
  
  def set_avatar
    if self.avatar.blank? 
      self.avatar = (user.avatar.url || configatron.default_avatar rescue configatron.default_avatar)
    end
  end
  
end


class Listen < ActiveRecord::Base
  include Rabbit
  
  belongs_to :user
  belongs_to :channel
  
  default_scope :order => :order_number
  scope :verified, :conditions => {:verified => true}
  
  # if a channel is public we set the verified status to public
  after_create  :auto_set_verification
  after_create  :send_subscribe_notification, :if => lambda {|listen| listen.verified?}
  after_destroy :send_unsubscribe_notification

  def auto_set_verification
    self.verified = true if channel.public? || channel.owned_by(user) || channel.rendezvous_participant?(user)
    save
  end
  
  def send_subscribe_notification
    send_channel_notification(:subscribed_channel)
  end

  def send_unsubscribe_notification
    send_channel_notification(:unsubscribed_channel)
  end

  def send_channel_notification(type)
    publish 'channels', "subscriptions",
      :trigger        => "user.#{type}",
      :channel_id     => channel.id,
      :channel_uuid   => channel.uuid,
      :user_id        => user.id
  end
  
  def self.update_last_read_meeps(user_id, mapping)
    sql_query = "UPDATE `#{Listen.table_name}` SET last_read_meep = (CASE id\n"
    mapping.each { |listen_id, meep_id|
      sql_query += self.sanitize_sql_for_conditions(["WHEN ? THEN ?\n", listen_id, meep_id])
    }
    sql_query += "ELSE last_read_meep END) "
    sql_query += "WHERE " + self.sanitize_sql_for_conditions(["user_id = ?", user_id])
    
    self.connection.execute(sql_query)
  end
end

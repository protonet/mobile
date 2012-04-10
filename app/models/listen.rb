class Listen < ActiveRecord::Base
  include Rabbit
  
  belongs_to :user
  belongs_to :channel
  
  scope :verified, where(:verified => true)
  scope :pending, where(:verified => false)
  scope :registered, where("users.temporary_identifier IS NULL AND users.id != -1 AND users.node_id = 1")
  
  # if a channel is public we set the verified status to public
  after_create  :auto_set_verification,:set_last_read_meep
  after_create  :send_subscribe_notification, :if => lambda {|listen| listen.verified?}
  after_destroy :send_verifications_notification, :if => lambda {|listen| !listen.verified? }
  after_destroy :send_unsubscribe_notification
  around_save :send_change_notification
  
  def send_change_notification
    changed = new_record? && !verified? || verified_changed?

    yield
    
    if changed
      send_verifications_notification
      if verified?
        send_subscribe_notification
        publish "users", user_id, { :trigger => 'channel.load', :channel_id => channel_id }
      end
    end
  end
  
  
  #def set_verified!
  #  self.verified = true
  #  if save
  #    send_subscribe_notification
  #    publish "users", user_id, { :trigger => 'channel.load', :channel_id => channel_id }
  #  end
  #end
  
  
  def send_verifications_notification
    publish "users", (User.admins | [channel.owner]).uniq.map(&:id), {
      :trigger  =>  "users.pending_verifications",
      :channel_id => channel.id,
      :pending_verifications => channel.listens.pending.count
    }
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
      :rendezvous     => channel.rendezvous?,
      :user_id        => user.id
  end
  
  def self.update_last_read_meeps(user_id, mapping)
    return if mapping.empty?
    sql_query = "UPDATE `#{Listen.table_name}` SET last_read_meep = (CASE id\n"
    mapping.each { |listen_id, meep_id|
      sql_query += self.sanitize_sql_for_conditions(["WHEN ? THEN ?\n", listen_id, meep_id])
    }
    sql_query += "ELSE last_read_meep END) "
    sql_query += "WHERE " + self.sanitize_sql_for_conditions(["user_id = ?", user_id])
    
    self.connection.execute(sql_query)
  end
  
  def set_last_read_meep
    self.last_read_meep = channel.meeps.last.id rescue 0
    save
  end
  
  def auto_set_verification
    self.verified = true if channel.public? || channel.owned_by?(user) || channel.rendezvous_participant?(user) || user.admin?
    save
  end
  
end

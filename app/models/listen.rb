class Listen < ActiveRecord::Base
  include Rabbit
  
  belongs_to :user
  belongs_to :channel
  
  scope :verified, where(:verified => true)
  scope :pending, where(:verified => false)
  scope :registered, where("users.temporary_identifier IS NULL AND users.id != -1 AND users.node_id = 1")
  
  # if a channel is public we set the verified status to public
  after_create  :auto_set_verification, :set_last_read_meep
  after_create  :create_system_folder, :if => lambda {|l| !l.user.stranger? && !l.user.system? && !l.channel.global? }
  after_create  :send_subscribe_notification, :if => lambda {|listen| listen.verified? }
  
  after_destroy :send_verifications_notification, :if => lambda {|listen| !listen.verified? }
  after_destroy :send_unsubscribe_notification
  after_destroy :remove_system_folder
  around_save   :send_change_notification, :if => lambda {|l| !l.channel.rendezvous? }
  
  def send_change_notification
    changed = (new_record? && !verified?) || verified_changed?

    yield
    
    if changed
      send_verifications_notification
      if verified?
        send_subscribe_notification
        publish "users", user_id, { :trigger => 'channel.load', :channel_id => channel_id }
      end
    end
  end
  
  def send_verifications_notification
    recipients = begin ((User.admins | [channel.owner]) - [User.system]).compact
      rescue NoMethodError
        [] 
      end
    recipients.each do |u|
      publish "users", u.id, {
        :trigger  =>  "users.pending_verifications",
        :channel_id => channel.id,
        :pending_verifications => channel.listens.pending.count
      }
    end
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
    return if self.verified?
    self.verified = true if channel.public? || channel.owned_by?(user) || channel.rendezvous_participant?(user) || user.admin?
    save
  end
  
  def verify!
    update_attribute(:verified, true)
  end

  def create_system_folder
    if channel.rendezvous?
      # create links for both users
      system_users_script("mount channels/#{channel.id} \"#{system_home_path_for(channel.rendezvous_participants.first)}/channels/shared between you and #{channel.rendezvous_participants.second.login}\"")
      system_users_script("mount channels/#{channel.id} \"#{system_home_path_for(channel.rendezvous_participants.second)}/channels/shared between you and #{channel.rendezvous_participants.first.login}\"")
    else
      system_users_script("mount channels/#{channel.id} #{system_home_path_for(user)}/channels/#{channel.name}")
    end
  end

  def remove_system_folder
    if channel.rendezvous?
      # nothing to do, rendezvous cannot be removed
    else
      system_users_script("umount system_users/#{user.login}/channels/#{channel.name}")
    end
  end
  
  
  def system_users_script(command)    
    if Rails.env.production?
      `/usr/bin/sudo #{Rails.root}/script/init/system_users #{command}`
    else
      `#{Rails.root}/script/init/system_users #{command}`
    end
  end

  def system_home_path_for(user)
    "system_users/#{user.login}"
  end
  
end

class AddLastSeenToUsers < ActiveRecord::Migration
  def self.up
    add_column :users, :last_seen, :datetime
    add_column :users, :notify_me, :boolean, :default => true
    User.registered.each do |user|
      user.save_offline_status
    end
  end

  def self.down
    remove_column :users, :notify_me
    remove_column :users, :last_seen
  end
end
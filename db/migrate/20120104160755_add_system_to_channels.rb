class AddSystemToChannels < ActiveRecord::Migration
  def self.up
    add_column :channels, :system, :boolean, :default => false
    system_user = User.system
    system_user.update_attributes({ :login => "System", :name => "System", :email => 'system@protonet.local' })
    system_user.avatar = File.new("#{Rails.root}/public#{configatron.system_avatar}")
    system_user.save
    Channel.system
  end

  def self.down
    Channel.system.destroy
    remove_column :channels, :system
    system_user = User.system
    system_user.update_attributes({ :login => "Anonymous", :name => "Anonymous" })
    system_user.avatar.destroy
  end
end

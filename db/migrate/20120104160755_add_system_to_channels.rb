class AddSystemToChannels < ActiveRecord::Migration
  def self.up
    add_column :channels, :system, :boolean, :default => false
    User.anonymous.update_attributes({ :login => "System", :name => "System" })
    Channel.system
  end

  def self.down
    remove_column :channels, :system
    User.anonymous.update_attributes({ :login => "Anonymous", :name => "Anonymous" })
  end
end

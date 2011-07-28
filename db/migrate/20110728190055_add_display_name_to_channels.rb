class AddDisplayNameToChannels < ActiveRecord::Migration
  def self.up
    add_column :channels, :display_name, :string
  end

  def self.down
    remove_column :channels, :display_name
  end
end
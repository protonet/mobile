class MakePublicFlagAnInteger < ActiveRecord::Migration
  def self.up
    add_column :channels, :flags, :integer, :default => 1
    Channel.reset_column_information
    Channel.all.each do |channel|
      channel.flags = 0 unless channel.public?
    end
    remove_column :channels, :public
  end

  def self.down
    add_column :channels, :public, :boolean, :default => 1
    Channel.reset_column_information
    Channel.all.each do |channel|
      channel.public = channel.public?
    end
    remove_column :channels, :flags
  end
end

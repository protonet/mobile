class MakePublicFlagAnInteger < ActiveRecord::Migration
  def self.up
    unless Channel.new.respond_to?(:flags)
      add_column :channels, :flags, :integer, :default => 1 # public = false and local = true
      Channel.reset_column_information
      Channel.all.each do |channel|
        channel.update_attribute(:flags, 1) if channel.public?
      end
    end
    remove_column :channels, :public
  end

  def self.down
    add_column :channels, :public, :boolean, :default => 1
    remove_column :channels, :flags
  end
end

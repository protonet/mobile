class AddFlagsToListens < ActiveRecord::Migration
  def self.up
    add_column :listens, :flags, :integer, :default => 0
    Listen.reset_column_information
    Listen.all.each do |listen|
      listen.verified = true
    end
  end

  def self.down
    remove_column :listens, :flags
  end
end

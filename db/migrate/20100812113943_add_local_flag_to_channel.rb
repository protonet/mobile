class AddLocalFlagToChannel < ActiveRecord::Migration
  def self.up
    add_column :channels, :local, :boolean, :default => true
  end

  def self.down
    remove_column :channels, :local
  end
end

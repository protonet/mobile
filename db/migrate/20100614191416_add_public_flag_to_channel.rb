class AddPublicFlagToChannel < ActiveRecord::Migration
  def self.up
    add_column :channels, :public, :boolean, :default => false
  end

  def self.down
    remove_column :channels, :public
  end
end

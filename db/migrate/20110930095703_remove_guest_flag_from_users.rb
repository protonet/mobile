class RemoveGuestFlagFromUsers < ActiveRecord::Migration
  def self.up
    remove_column :users, :guest
  end

  def self.down
    add_column :users, :guest, :boolean, :default => true
  end
end

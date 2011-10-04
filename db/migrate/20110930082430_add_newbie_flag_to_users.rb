class AddNewbieFlagToUsers < ActiveRecord::Migration
  def self.up
    add_column :users, :newbie, :boolean, :default => true
    User.update_all(:newbie => false)
  end

  def self.down
    remove_column :users, :newbie
  end
end

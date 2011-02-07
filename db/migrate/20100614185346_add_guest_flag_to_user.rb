class AddGuestFlagToUser < ActiveRecord::Migration
  def self.up
    add_column :users, :guest, :boolean, :default => true
    User.all.where(:admin => true).each do |user|
      user.update_attribute(:guest, false)
    end
  end
    
  def self.down
    remove_column :users, :guest
  end
end

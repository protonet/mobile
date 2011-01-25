class RemoveAdminFlagFromUsers < ActiveRecord::Migration
  def self.up
    User.all.each { |user| user.add_to_role('admin') if user.admin }
    
    remove_column :users, :admin
  end

  def self.down
    add_column :users, :admin, :boolean, :default => false, :after => :temporary_identifier
    
    Role.find_by_title('admin').users.each { |user| user.update_attribute(:admin, true) }
  end
end

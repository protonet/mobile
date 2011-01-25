class CreateRoles < ActiveRecord::Migration
  def self.up
    create_table :roles do |t|
      t.string :title
      t.timestamps
    end
    
    create_table :roles_users, :id => false do |t|
      t.integer :role_id, :user_id
    end
    
    add_index :roles_users, [:role_id, :user_id], :unique => true
    
    admin_role = Role.create(:title => "admin")
    user_role  = Role.create(:title => "user")
    User.all.each do |user|
      user.add_to_role('user') unless user.stranger?
      user.add_to_role('admin') if user.admin
    end
  end

  def self.down
    drop_table :roles
    drop_table :roles_users
  end
end

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
      user.roles << user_role unless user.stranger?
      user.roles << admin_role if user.admin?
    end
  end

  def self.down
    drop_table :roles
    drop_table :roles_users
  end
end

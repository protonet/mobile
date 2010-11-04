class MigrateRestfulToDevise < ActiveRecord::Migration
  def self.up
    change_column :users, :crypted_password, :string, :limit => 128, :default => "", :null => false
    change_column :users, :salt, :string, :limit => false, :default => "", :null => false
    rename_column :users, :crypted_password, :encrypted_password
    rename_column :users, :salt, :password_salt
    remove_column :users, :remember_token_expires_at
    add_column :users, :remember_created_at, :datetime
  end

  def self.down
    rename_column :users, :encrypted_password, :crypted_password
    rename_column :users, :password_salt, :salt
    add_column :users, :remember_token_expires_at, :datetime
    remove_column :users, :remember_created_at
  end
end

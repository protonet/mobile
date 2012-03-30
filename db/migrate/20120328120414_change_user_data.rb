class ChangeUserData < ActiveRecord::Migration
  def self.up
    add_column :users, :last_name, :string, :default => ""
    rename_column :users, :name, :first_name
  end

  def self.down
    remove_column :users, :last_name
    rename_column :users, :first_name, :name
  end
end
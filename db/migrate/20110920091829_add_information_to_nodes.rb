class AddInformationToNodes < ActiveRecord::Migration
  def self.up
    remove_column :nodes, :type
    add_column :nodes, :description, :string
    add_column :nodes, :uuid, :string
    add_column :nodes, :url, :string
    add_column :nodes, :api_user, :string
    add_column :nodes, :api_password, :string
  end

  def self.down
    remove_column :nodes, :api_password
    remove_column :nodes, :api_user
    remove_column :nodes, :url
    remove_column :nodes, :uuid
    remove_column :nodes, :description
    add_column :nodes, :type, :string
  end
end
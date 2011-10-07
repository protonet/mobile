class HandleNodeAssociations < ActiveRecord::Migration
  def self.up
    rename_column :meeps, :network_id, :node_id
    rename_column :channels, :network_id, :node_id
    add_column    :users, :node_id, :integer, :default => 1
  end

  def self.down
    remove_column :users, :node_id
    rename_column :channels, :node_id, :network_id
    rename_column :meeps, :node_id, :network_id
  end
end
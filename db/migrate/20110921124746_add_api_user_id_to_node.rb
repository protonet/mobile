class AddApiUserIdToNode < ActiveRecord::Migration
  def self.up
    add_column :nodes, :api_user_id, :integer
  end

  def self.down
    remove_column :nodes, :api_user_id
  end
end
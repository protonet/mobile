class AddNetworkIdToTweets < ActiveRecord::Migration
  def self.up
    add_column :tweets, :network_id, :integer, :default => 1
  end

  def self.down
    remove_column :tweets, :network_id
  end
end

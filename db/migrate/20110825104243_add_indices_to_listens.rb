class AddIndicesToListens < ActiveRecord::Migration
  def self.up
    add_index :listens, [:user_id, :verified], :name => "l_user_id_verified", :unique => false
    add_index :listens, [:channel_id, :verified], :name => "l_channel_id_verified", :unique => false
  end

  def self.down
    remove_index :listens, :name => :l_user_id_verified
    remove_index :listens, :name => :l_channel_id_verified
  end
end
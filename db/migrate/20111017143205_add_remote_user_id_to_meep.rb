class AddRemoteUserIdToMeep < ActiveRecord::Migration
  def self.up
    add_column :meeps, :remote_user_id, :string, :default => nil
  end

  def self.down
    remove_column :meeps, :remote_user_id
  end
end
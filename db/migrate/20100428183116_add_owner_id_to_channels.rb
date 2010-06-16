class AddOwnerIdToChannels < ActiveRecord::Migration
  def self.up
    add_column :channels, :owner_id, :integer
    Channel.update_all("owner_id = 0") # ridiciulous but we don't have any other way of determining the owners at this point
    # all future channels will have one, current installations need to be switched by hand
  end

  def self.down
    remove_column :channels, :owner_id
  end
end

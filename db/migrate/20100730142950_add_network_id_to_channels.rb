class AddNetworkIdToChannels < ActiveRecord::Migration
  def self.up
    add_column :channels, :network_id, :integer, :default => 1
    #  make the first entry your local node
    Network.find(1).update_attributes({:name => 'local', :description => 'your local node', :key => nil, :supernode => nil})
    Channel.update_all('network_id = 1')
  end

  def self.down
    remove_column :channels, :network_id
  end
end

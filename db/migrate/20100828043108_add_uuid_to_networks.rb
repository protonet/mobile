class AddUuidToNetworks < ActiveRecord::Migration
  def self.up
    add_column :networks, :uuid, :string
    Network.all.each do |network|
      network.generate_uuid
    end
  end

  def self.down
    remove_column :networks, :uuid
  end
end

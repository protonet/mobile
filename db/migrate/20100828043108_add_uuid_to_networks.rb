class AddUuidToNetworks < ActiveRecord::Migration
  def self.up
    unless Network.column_names.include?("uuid")
      add_column :networks, :uuid, :string
      Network.all.each do |network|
        network.generate_uuid
      end
    end
  end

  def self.down
    remove_column :networks, :uuid
  end
end

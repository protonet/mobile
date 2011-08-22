class AddRendezvousToChannels < ActiveRecord::Migration
  def self.up
    add_column :channels, :rendezvous, :string
  end

  def self.down
    remove_column :channels, :rendezvous
  end
end

class CreateNetworks < ActiveRecord::Migration
  def self.up
    create_table :networks do |t|
      t.string      :name
      t.string      :description
      t.string      :key
      t.string      :supernode
      t.string      :uuid
      t.timestamps
    end
    
    # create the default network
    Network.new(:id => 1, :name => 'hamburg-protonet', :description => 'first ever group', :key => 'encryptme', :supernode => 'flyingseagull.de:1099').save
    
  end

  def self.down
    drop_table :networks
  end
end

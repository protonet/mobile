class CreateNetworks < ActiveRecord::Migration
  def self.up
    create_table :networks do |t|
      t.string      :name
      t.text        :key
      t.text        :descrition
      t.string      :supernode
      t.timestamps
    end
    
    # create the default home channel
    Network.new(:id => 1, :name => 'hamburg-protonet', :description => 'first ever group').save
    
  end

  def self.down
    drop_table :networks
  end
end

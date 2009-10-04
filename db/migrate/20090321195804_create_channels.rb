class CreateChannels < ActiveRecord::Migration
  def self.up
    create_table :channels do |t|
      t.string  :name
      t.text    :description
      t.timestamps
    end
    # create the default home channel
    Channel.new(:id => 1, :name => 'home', :description => 'your homebase - your node :)').save
  end

  def self.down
    drop_table :channels
  end
end

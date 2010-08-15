class CreateChannels < ActiveRecord::Migration
  def self.up
    create_table :channels do |t|
      t.string  :name
      t.text    :description
      t.string  :uuid
      t.integer :flags, :default => 3 # public = false and local = true
      t.timestamps
    end
    # create the default home channel
    Channel.home
  end

  def self.down
    drop_table :channels
  end
end

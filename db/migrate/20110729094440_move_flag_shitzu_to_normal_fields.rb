class MoveFlagShitzuToNormalFields < ActiveRecord::Migration
  def self.up
    rename_column :listens, :flags, :verified
    change_table :listens do |t|
      t.change :verified, :boolean, :default => false
    end
    add_column :channels, :public, :boolean, :default => true
    add_column :channels, :global, :boolean, :default => false
    Channel.all.each do |c|
      c.update_attribute(:public, c.flags & 1 == 1)
      c.update_attribute(:global, c.flags & 2 == 1)
    end
    remove_column :channels, :flags
  end

  def self.down
    rename_column :listens, :verified, :flags
    change_table :listens do |t|
      t.change :verified, :integer
    end
    puts "Channel flags have to be managed by flagshitzu for this down migration to work. Allowing you 2 minutes to abort this!"
    sleep 120
    add_column :channels, :flags
    Channel.all.each do |c|
      c.public = c.attributes["public"]
      c.global = c.attributes["global"]
    end
    remove_column :channels, :public
    remove_column :channels, :global
  end
end
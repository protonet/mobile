class CreateListens < ActiveRecord::Migration
  def self.up
    create_table :listens do |t|
      t.integer :channel_id
      t.integer :user_id
      t.integer :flags, :integer, :default => 0
      t.timestamps
    end
  end

  def self.down
    drop_table :listens
  end
end

class CreateNodes < ActiveRecord::Migration
  def self.up
    create_table :nodes do |t|
      t.string :name
      t.string :type
      t.integer :network_id

      t.timestamps
    end
  end

  def self.down
    drop_table :nodes
  end
end

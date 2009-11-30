class CreateAssets < ActiveRecord::Migration
  def self.up
    create_table :assets do |t|
      t.string :filename
      t.string :content_type
      t.integer :size
      t.integer :download_counter

      t.timestamps
    end
  end

  def self.down
    drop_table :assets
  end
end

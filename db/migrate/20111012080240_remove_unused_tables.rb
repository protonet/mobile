class RemoveUnusedTables < ActiveRecord::Migration
  def self.up
    drop_table :images_avatars
    drop_table :images_externals
  end

  def self.down
    create_table :images_avatars, :force => true do |t|
      t.string   "name"
      t.integer  "user_id"
      t.timestamps
    end
    create_table :images_externals, :force => true do |t|
      t.text     "image_url"
      t.timestamps
    end
  end
end
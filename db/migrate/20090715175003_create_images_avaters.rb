class CreateImagesAvaters < ActiveRecord::Migration
  def self.up
    create_table :images_avatars do |t|
      t.string :name
      t.integer :user_id

      t.timestamps
    end
  end

  def self.down
    drop_table :images_avatars
  end
end

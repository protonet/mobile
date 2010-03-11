class CreateImagesExternals < ActiveRecord::Migration
  def self.up
    create_table :images_externals do |t|
      t.text    :image_url
      t.timestamps
    end
  end

  def self.down
    drop_table :images_externals
  end
end
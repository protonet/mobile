class CreateAppSources < ActiveRecord::Migration
  def self.up
    create_table :app_sources do |t|
      t.string :title
      t.string :url
      t.text :definitions

      t.timestamps
    end
  end

  def self.down
    drop_table :app_sources
  end
end

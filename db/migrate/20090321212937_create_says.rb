class CreateSays < ActiveRecord::Migration
  def self.up
    create_table :says do |t|
      t.integer :audience_id
      t.integer :tweet_id
      t.timestamps
    end
  end

  def self.down
    drop_table :says
  end
end

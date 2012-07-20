class CreateNotifications < ActiveRecord::Migration
  def self.up
    create_table :notifications do |t|
      t.string :event_type
      t.integer :subject_id
      t.string :subject_type
      t.integer :actor_id
      t.string :actor_type
      t.integer :secondary_subject_id
      t.string :secondary_subject_type

      t.timestamps
    end
  end

  def self.down
    drop_table :notifications
  end
end

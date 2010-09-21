class AddPreferencesTable < ActiveRecord::Migration
  def self.up
    create_table :system_preferences, :force => true do |t|
      t.string :var, :null => false
      t.text   :value, :null => true
      t.integer :object_id, :null => true
      t.string :object_type, :limit => 30, :null => true
      t.timestamps
    end
    
    add_index :system_preferences, [ :object_type, :object_id, :var ], :unique => true
  end

  def self.down
    drop_table :system_preferences
  end
end

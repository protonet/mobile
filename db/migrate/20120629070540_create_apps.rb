class CreateApps < ActiveRecord::Migration
  def self.up
    create_table :apps do |t|
      t.string :key
      t.string :install_dep_path
      t.string :uninstall_dep_path
      t.string :description
      t.string :homepage
      t.string :display_name

      t.timestamps
    end
  end

  def self.down
    drop_table :apps
  end
end

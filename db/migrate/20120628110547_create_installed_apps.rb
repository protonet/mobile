class CreateInstalledApps < ActiveRecord::Migration
  def self.up
    create_table :installed_apps do |t|
      t.string :name
      t.string :uninstall_dep_path
      t.string :install_dep_path

      t.timestamps
    end
  end

  def self.down
    drop_table :installed_apps
  end
end

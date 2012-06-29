class CreateAppDashboardBindings < ActiveRecord::Migration
  def self.up
    create_table :app_dashboard_bindings do |t|
      t.string :app_name
      t.string :link_title
      t.string :app_path
      t.string :app_key
      t.string :app_host
      t.integer :app_port
      t.integer :installed_app_id
      t.string :binding_file_path

      t.timestamps
    end
  end

  def self.down
    drop_table :app_dashboard_bindings
  end
end

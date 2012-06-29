class ChangeInstalledAppIdToAppIdInDashboardBindings < ActiveRecord::Migration
  def self.up
    rename_column :app_dashboard_bindings, :installed_app_id, :app_id
  end

  def self.down
    rename_column :app_dashboard_bindings, :app_id, :installed_app_id
  end
end

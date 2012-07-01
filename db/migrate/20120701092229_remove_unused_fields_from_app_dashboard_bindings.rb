class RemoveUnusedFieldsFromAppDashboardBindings < ActiveRecord::Migration
  class AppDashboardBinding < ActiveRecord::Base; end
  def self.up
    remove_column :app_dashboard_bindings, :app_name
    remove_column :app_dashboard_bindings, :binding_file_path
  end

  def self.down
    add_column :app_dashboard_bindings, :app_name, :string
    add_column :app_dashboard_bindings, :binding_file_path, :string
  end
end

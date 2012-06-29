module AppManager

  def self.dashboard_bindings
    return @protonet_bindings unless @protonet_bindings.blank?
    return [] unless configatron.app_manager.exists?(:apps_path)
    protonet_binding_files = Dir.glob(File.join(configatron.app_manager.apps_path, '**/protonet_binding.yml'))
    bindings_from_files = protonet_binding_files.map {|protonet_binding_file| AppManager::AppDashboardBinding.new_from_path(protonet_binding_file)}
    @protonet_bindings = bindings_from_files
  end

  def self.find(app_key)
    protonet_bindings.detect { |pb| pb.app_key == app_key }
  end

  
end
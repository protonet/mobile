Merb.logger.info("Loaded DEVELOPMENT Environment...")
Merb::Config.use { |c|
  c[:exception_details] = true
  c[:reload_classes] = true
  c[:reload_time] = 0.5
  c[:log_auto_flush ] = true
}
Merb::BootLoader.after_app_loads do
  # configure our backend to be the mock backend
  Backend.backend_connection = BackendAdapters::DevelopmentMock
end
Merb.logger.info("Loaded PRODUCTION Environment...")
Merb::Config.use { |c|

  # merb internals
  c[:exception_details] = false
  c[:reload_classes] = false
  c[:log_level] = :error
  c[:log_file] = Merb.log_path + "/production.log"

  # app and node configuration
  # configure our backend to be the ubuntu backend
  c[:backend_adapter] = :ubuntu
}
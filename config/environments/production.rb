Merb.logger.info("Loaded PRODUCTION Environment...")
Merb::Config.use { |c|
  c[:exception_details] = false
  c[:reload_classes] = false
  c[:log_level] = :error
  
  c[:log_file]  = Merb.root / "log" / "production.log"
  # or redirect logger using IO handle
  # c[:log_stream] = STDOUT
  
  # app and node configuration
  # configure our backend to be the ubuntu backend
  c[:backend_adapter] = :ubuntu
  
}

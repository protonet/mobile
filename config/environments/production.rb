# Settings specified here will take precedence over those in config/environment.rb

# The production environment is meant for finished, "live" apps.
# Code is not reloaded between requests
config.cache_classes = true

# Full error reports are disabled and caching is turned on
config.action_controller.consider_all_requests_local = false
config.action_controller.perform_caching             = true
config.action_view.cache_template_loading            = true

# See everything in the log (default is :info)
# config.log_level = :debug

# Use a different logger for distributed setups
# config.logger = SyslogLogger.new

# Use a different cache store in production
# config.cache_store = :mem_cache_store

# Enable serving of images, stylesheets, and javascripts from an asset server
# config.action_controller.asset_host = "http://assets.example.com"

# Disable delivery errors, bad email addresses will be ignored
# config.action_mailer.raise_delivery_errors = false

# Enable threaded mode
# config.threadsafe!
System::Backend.backend_connection = BackendAdapters::Ubuntu.new
puts "Backend '#{System::Backend.backend_connection.info}' connected successfully!"

configatron.current_file_path = "/home/protonet/dashboard/current"
configatron.shared_file_path  = "/home/protonet/dashboard/shared"
configatron.deploy_config_file_path = "#{configatron.shared_file_path}/config/protonet.d/deploy_config"
configatron.user_file_path    = "#{configatron.shared_file_path}/user-files"
configatron.images.avatars_path   = "public/system/avatars"
configatron.images.externals_path = "public/system/externals"

configatron.ldap.active = false
configatron.socket.port = 5000
configatron.longpolling_port.port = 8000
configatron.nodejs.port = 8124
# checks for stage specific config files
stage_config = "#{RAILS_ROOT}/config/environments/stage.rb"
eval(IO.read(stage_config), binding, stage_config) if test(?f, stage_config)
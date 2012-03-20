Dashboard::Application.configure do
  # Settings specified here will take precedence over those in config/environment.rb
  
  # The production environment is meant for finished, "live" apps.
  # Code is not reloaded between requests
  config.cache_classes = true
  
  # Full error reports are disabled and caching is turned on
  config.consider_all_requests_local                   = false
  config.action_controller.perform_caching             = true
  
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
  
  config.action_dispatch.x_sendfile_header = "X-Sendfile"
  
  configatron.current_file_path = "/home/protonet/dashboard/current"
  configatron.shared_file_path  = "/home/protonet/dashboard/shared"
  configatron.deploy_config_file_path = "#{configatron.shared_file_path}/config/protonet.d/deploy_config"
  configatron.user_file_path    = "#{configatron.shared_file_path}/user-files"
  configatron.images.avatars_path   = "public/system/avatars"
  configatron.images.externals_path = "public/system/externals"
  
  configatron.ldap.active = false
  configatron.web_app_port        = 80
  configatron.socket.port         = 5000
  configatron.xhr_streaming.port  = 8000
  configatron.websocket.port      = 80
  configatron.websocket_ssl.port  = 443
  configatron.nodejs.port         = 8124
  # checks for stage specific config files
  stage_config = "#{configatron.shared_file_path}/config/stage.rb"
  eval(IO.read(stage_config), binding, stage_config) if test(?f, stage_config)
  
  configatron.oauth_host = "http://oauth.protonet.info"
end

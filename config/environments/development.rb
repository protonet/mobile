Dashboard::Application.configure do
  # Settings specified here will take precedence over those in config/environment.rb
  
  # In the development environment your application's code is reloaded on
  # every request.  This slows down response time but is perfect for development
  # since you don't have to restart the webserver when you make code changes.
  config.cache_classes = false
  
  # Log error messages when you accidentally call methods on nil.
  config.whiny_nils = true
  
  config.cache_store = :memory_store
  
  # Show full error reports and disable caching
  config.consider_all_requests_local                   = true
  config.action_view.debug_rjs                         = true
  config.action_controller.perform_caching             = false
  
  # Don't care if the mailer can't send
  config.action_mailer.raise_delivery_errors = false
  config.action_mailer.delivery_method = :sendmail
  
  config.active_support.deprecation = :log
  
  configatron.files_path = Rails.root.to_s + "/tmp/development/shared/files"
  
  configatron.images.avatars_path   = "public/avatars"
  configatron.images.externals_path = "public/externals"
  configatron.socket.port        = 5000
  configatron.xhr_streaming.port = 8000
  configatron.websocket.port     = 5001
  configatron.websocket_ssl.port = 5002
  
  # Log all js event notifications
  configatron.log_event_notifications = true
  configatron.avoid_caching = true
  configatron.nodejs.port = 8124
  
  configatron.oauth_host = "http://oauth.protonet.info"
end
Dashboard::Application.configure do
  # Edit at your own peril - it's recommended to regenerate this file
  # in the future when you upgrade to a newer version of Cucumber.
  
  # IMPORTANT: Setting config.cache_classes to false is known to
  # break Cucumber's use_transactional_fixtures method.
  # For more information see https://rspec.lighthouseapp.com/projects/16211/tickets/165
  config.cache_classes = true
  
  # Log error messages when you accidentally call methods on nil.
  config.whiny_nils = true
  
  config.active_support.deprecation = :stderr
  
  # Show full error reports and disable caching
  config.consider_all_requests_local                   = true
  config.action_controller.perform_caching             = true
  
  # Disable request forgery protection in test environment
  config.action_controller.allow_forgery_protection    = false
  
  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test
  
  configatron.user_file_path = Rails.root.to_s + "/tmp/test/shared/user-files"
  FileUtils.mkdir_p(configatron.user_file_path)

  configatron.images.avatars_path   = "public/avatars"
  configatron.images.externals_path = "public/externals"
  FileUtils.mkdir_p(configatron.images.externals_path + "/image_proxy")
  FileUtils.mkdir_p(configatron.images.externals_path + "/screenshots")
  FileUtils.mkdir_p(configatron.images.externals_path + "/snapshots")
  
  configatron.socket.port         = 5005
  configatron.websocket.port      = 5006
  configatron.websocket_ssl.port  = 5007
  configatron.xhr_streaming.port  = 8001
  configatron.nodejs.port         = 8125
  configatron.js_dispatching_active = true
  configatron.messaging_bus_active  = true
  
  configatron.oauth_host = "http://oauth.protonet.info"
  
  configatron.amqp.vhost  = "/test"
end
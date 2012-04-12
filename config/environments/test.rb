Dashboard::Application.configure do
  # Settings specified here will take precedence over those in config/environment.rb
  
  # The test environment is used exclusively to run your application's
  # test suite.  You never need to work with it otherwise.  Remember that
  # your test database is "scratch space" for the test suite and is wiped
  # and recreated between test runs.  Don't rely on the data there!
  config.cache_classes = true
  
  # Log error messages when you accidentally call methods on nil.
  config.whiny_nils = true
  
  config.active_support.deprecation = :stderr
  
  # Show full error reports and disable caching
  config.consider_all_requests_local                   = true
  config.action_controller.perform_caching             = false
  
  # Disable request forgery protection in test environment
  config.action_controller.allow_forgery_protection    = false
  
  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test
  
  # Use SQL instead of Active Record's schema dumper when creating the test database.
  # This is necessary if your schema can't be completely dumped by the schema dumper,
  # like if you have constraints or database-specific column types
  # config.active_record.schema_format = :sql
  
  configatron.user_file_path = Rails.root.to_s + "/tmp/test/shared/user-files"
  FileUtils.mkdir_p(configatron.user_file_path)
  
  configatron.images.avatars_path   = Rails.root.to_s + "/public/avatars"
  configatron.images.externals_path = Rails.root.to_s + "/public/externals"
  FileUtils.mkdir_p(configatron.images.externals_path + "/image_proxy")
  FileUtils.mkdir_p(configatron.images.externals_path + "/screenshots")
  FileUtils.mkdir_p(configatron.images.externals_path + "/snapshots")
  
  configatron.socket.port         = 5005
  configatron.websocket.port      = 5006
  configatron.websocket_ssl.port  = 5007
  configatron.xhr_streaming.port  = 8001
  configatron.nodejs.port         = 8125
  
  configatron.oauth_host = "http://oauth.protonet.info"
  
  configatron.amqp.vhost  = "/test"
end
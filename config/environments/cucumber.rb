# Edit at your own peril - it's recommended to regenerate this file
# in the future when you upgrade to a newer version of Cucumber.

# IMPORTANT: Setting config.cache_classes to false is known to
# break Cucumber's use_transactional_fixtures method.
# For more information see https://rspec.lighthouseapp.com/projects/16211/tickets/165
config.cache_classes = true

# Log error messages when you accidentally call methods on nil.
config.whiny_nils = true

# Show full error reports and disable caching
config.action_controller.consider_all_requests_local = true
config.action_controller.perform_caching             = true

# Disable request forgery protection in test environment
config.action_controller.allow_forgery_protection    = false

# Tell Action Mailer not to deliver emails to the real world.
# The :test delivery method accumulates sent emails in the
# ActionMailer::Base.deliveries array.
config.action_mailer.delivery_method = :test

System::Backend.backend_connection = BackendAdapters::DevelopmentMock.new
puts "Backend '#{System::Backend.backend_connection.info}' connected successfully!"

configatron.user_file_path = "/tmp"
configatron.images.avatars_path   = "public/avatars"
configatron.images.externals_path = "public/externals"

configatron.socket.port = 5001
configatron.longpolling.port = 8001
configatron.nodejs.port = 8125
configatron.js_dispatching_active = true
configatron.messaging_bus_active  = true

configatron.amqp.vhost  = "/test"
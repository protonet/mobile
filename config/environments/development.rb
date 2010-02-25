# Settings specified here will take precedence over those in config/environment.rb

# In the development environment your application's code is reloaded on
# every request.  This slows down response time but is perfect for development
# since you don't have to restart the webserver when you make code changes.
config.cache_classes = false

# Log error messages when you accidentally call methods on nil.
config.whiny_nils = true

# Show full error reports and disable caching
config.action_controller.consider_all_requests_local = true
config.action_view.debug_rjs                         = true
config.action_controller.perform_caching             = false

# Don't care if the mailer can't send
config.action_mailer.raise_delivery_errors = false

System::Backend.backend_connection = BackendAdapters::DevelopmentMock.new
puts "Backend '#{System::Backend.backend_connection.info}' connected successfully!"

if File.exists?(File.join(RAILS_ROOT,'tmp', 'debug.txt'))
  require 'ruby-debug'
  Debugger.wait_connection = true
  Debugger.start_remote
  File.delete(File.join(RAILS_ROOT,'tmp', 'debug.txt'))
end

configatron.user_file_path = RAILS_ROOT + "/../shared/user-files"
configatron.images.avatars_path   = "public/avatars"
configatron.images.externals_path = "public/externals"

# TODO: RAILS 3
# require 'dispatcher'
# Dispatcher.to_prepare do

  SystemPreferences.defaults[:wifi_mode] = :dual
  SystemPreferences.defaults[:admin_key] = ActiveSupport::SecureRandom.base64(10)
  SystemPreferences.defaults[:allow_dashboard_for_strangers] = true
  SystemPreferences.defaults[:allow_registrations_for_strangers] = true
  SystemPreferences.defaults[:public_host] = "localhost:3000"
  
# end
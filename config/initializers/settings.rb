require 'dispatcher'
Dispatcher.to_prepare do

  System::Preferences.defaults[:wifi_mode] = :dual
  System::Preferences.defaults[:admin_key] = ActiveSupport::SecureRandom.base64(10)
  System::Preferences.defaults[:allow_dashboard_for_strangers]      = true
  System::Preferences.defaults[:allow_registrations_for_strangers]  = true
  System::Preferences.defaults[:public_host]        = "localhost:3000"
  System::Preferences.defaults[:public_host_https]  = false
  
end
# preference defaults are stored in the class variables of the systempreferences object
# since rails reloads those models we'll need to reset these on every request
Dashboard::Application.config.to_prepare do
  SystemPreferences.defaults[:wifi_mode] = :dual
  SystemPreferences.defaults[:admin_key] = ActiveSupport::SecureRandom.base64(10)
  SystemPreferences.defaults[:privacy] = {
    "lo0" => {
      "allow_dashboard_for_strangers" => true,
      "allow_registrations_for_strangers" => true
    },
    "eth0" => {
      "allow_dashboard_for_strangers" => true,
      "allow_registrations_for_strangers" => true
    },
    "wlan0" => {
      "allow_dashboard_for_strangers" => true,
      "allow_registrations_for_strangers" => true
    }
  }
  SystemPreferences.defaults[:wifi] = {
    "mode" => :dual,
    "wlan0" => {
      "name" => "private",
      "password" => ActiveSupport::SecureRandom.base64(10),
      "sharing"  => true,
      "ip" => "10.42.0.1"
    },
    "wlan1" => {
      "name" => "public",
      "password" => "",
      "sharing"  => false,
      "ip" => "10.43.0.1"
    }
  }
  SystemPreferences.defaults[:allow_dashboard_for_strangers] = true
  SystemPreferences.defaults[:allow_registrations_for_strangers] = true
  SystemPreferences.defaults[:public_host] = "localhost:3000"
  SystemPreferences.defaults[:public_host_https]  = false
  SystemPreferences.defaults[:captive_portal_greeting] = "Das ist das Captive Portal, Hallo!"
end

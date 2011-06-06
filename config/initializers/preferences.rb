# preference defaults are stored in the class variables of the systempreferences object
# since rails reloads those models we'll need to reset these on every request
Dashboard::Application.config.to_prepare do
  SystemPreferences.defaults[:wifi_mode] = :dual
  SystemPreferences.defaults[:admin_key] = ActiveSupport::SecureRandom.base64(10)
  SystemPreferences.privacy = {
    "fallback" => {
      "allow_dashboard_for_strangers" => true,
      "allow_registrations_for_strangers" => true
    },
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
  SystemPreferences.defaults[:browser_title] = "protonet - it's yours"
  SystemPreferences.defaults[:show_user_navigation] = true
  SystemPreferences.defaults[:show_clouds] = true
  SystemPreferences.defaults[:show_search_widget] = true
  SystemPreferences.defaults[:show_user_widget] = true
  SystemPreferences.defaults[:show_file_widget] = true
  SystemPreferences.defaults[:show_only_online_users] = false
  SystemPreferences.defaults[:default_registered_user_group] = "user"
  SystemPreferences.defaults[:default_stranger_user_group] = "guest"
  SystemPreferences.defaults[:allow_modal_views] = true
  SystemPreferences.defaults[:custom_css_type] = "append"

end

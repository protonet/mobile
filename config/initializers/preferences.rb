# preference defaults are stored in the class variables of the systempreferences object
# since rails reloads those models we'll need to reset these on every request
Dashboard::Application.config.to_prepare do
  SystemPreferences.defaults[:wifi_mode] = :dual
  SystemPreferences.defaults[:admin_key] = ActiveSupport::SecureRandom.base64(10)
  SystemPreferences.defaults[:privacy] = {
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
    "published_to_web" => {
      "allow_dashboard_for_strangers" => false,
      "allow_registrations_for_strangers" => false
    },
    "wlan0" => {
      "allow_dashboard_for_strangers" => true,
      "allow_registrations_for_strangers" => true
    }
  }
  SystemPreferences.defaults[:wifi] = {
    "mode" => "wlan0",
    "channel" => 1,
    "wlan0" => {
      "name" => "protonet-private",
      "password" => "Changeme!123",
      "sharing"  => true,
      "ip" => "10.42.0.1"
    },
    "wlan1" => {
      "name" => "protonet-public",
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
  SystemPreferences.defaults[:show_clouds] = true
  SystemPreferences.defaults[:show_search_widget] = true
  SystemPreferences.defaults[:show_user_widget] = true
  SystemPreferences.defaults[:show_file_widget] = true
  SystemPreferences.defaults[:show_only_online_users] = false
  SystemPreferences.defaults[:default_registered_user_group] = "user"
  SystemPreferences.defaults[:default_stranger_user_group] = "guest"
  SystemPreferences.defaults[:allow_modal_views] = true
  SystemPreferences.defaults[:custom_css_type] = "append"
  SystemPreferences.defaults[:whitelist] = []

  # setup email settings from preferences
  local_email_delivery = (SystemPreferences.local_email_delivery == true) rescue false
  if local_email_delivery
    if ["smtp_address", "smtp_domain", "smtp_username", "smtp_password"].none? { |s| SystemPreferences[s].blank? }
      ActionMailer::Base.smtp_settings = {
        :address              => SystemPreferences.smtp_address,
        :port                 => 587,
        :domain               => SystemPreferences.smtp_domain,
        :user_name            => SystemPreferences.smtp_username,
        :password             => SystemPreferences.smtp_password,
        :authentication       => "plain",
        :enable_starttls_auto => true
      }
      ActionMailer::Base.delivery_method = :smtp
    else
      ActionMailer::Base.delivery_method = :sendmail
    end
  else
    ActionMailer::Base.delivery_method = ProtonetEmailService
  end
  
  # catching exceptions since this can be called even before the database has
  # been created and would cause ActiveRecord to raise an sql table missing error
  begin
    ptw_name = "protonet-#{ActiveSupport::SecureRandom.hex(3)}"
    SystemPreferences.publish_to_web_name ||= ptw_name
  rescue
    SystemPreferences.defaults[:publish_to_web_name] = ptw_name
  end
end

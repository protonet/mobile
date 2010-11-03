System::Preferences.defaults[:wifi_mode] = :dual
System::Preferences.defaults[:admin_key] = ActiveSupport::SecureRandom.base64(10)
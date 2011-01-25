Network.local
Role.find_or_create_by_title('admin')
Role.find_or_create_by_title('user')
Role.find_or_create_by_title('guest')
User.anonymous
Channel.home
System::Preferences.vpn = {:identifier => Network.local.uuid, :password => ActiveSupport::SecureRandom.base64(10)}
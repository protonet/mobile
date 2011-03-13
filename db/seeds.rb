Network.local
Role.find_or_create_by_title('admin')
Role.find_or_create_by_title('user')
Role.find_or_create_by_title('guest')
Role.find_or_create_by_title('invitee')
User.anonymous
Channel.home
SystemPreferences.vpn = {:identifier => Network.local.uuid, :password => ActiveSupport::SecureRandom.base64(10)}
SystemPreferences.node_name = "protonet-#{ActiveSupport::SecureRandom.base64(6)}"
SystemPreferences.node_description = "this is your own node"
SystemPreferences.node_supernode = "localhost"
SystemPreferences.node_key  = "encryptme"
SystemPreferences.node_uuid = UUID4R::uuid(1)
#  this code is duplicated in the rake task -> dashboard.rake -> reset_admin_key
SystemPreferences.admin_key = ActiveSupport::SecureRandom.base64(10)
puts "\n\nUse this key to become an admin, can only be used once:\n\n#{SystemPreferences.admin_key}\n\nbe careful!" unless Rails.env.test?
Network.local
Role.find_or_create_by_title('admin')
Role.find_or_create_by_title('user')
Role.find_or_create_by_title('guest')
Role.find_or_create_by_title('invitee')
User.anonymous
Channel.home
SystemPreferences.vpn = {:identifier => Network.local.uuid, :password => ActiveSupport::SecureRandom.base64(10)}
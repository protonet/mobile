SystemPreferences.node_name = SystemPreferences.publish_to_web_name
SystemPreferences.node_description = "this is your own node"
SystemPreferences.node_supernode = "localhost"
SystemPreferences.node_key  = "encryptme"
SystemPreferences.node_uuid = UUID4R::uuid(1)
#  this code is duplicated in the rake task -> dashboard.rake -> reset_admin_key
Network.local
Role.find_or_create_by_title('admin')
Role.find_or_create_by_title('user')
Role.find_or_create_by_title('guest')
Role.find_or_create_by_title('invitee')
User.anonymous
Channel.home
admin = User.create(:login => 'admin', :email => 'admin@protonet.local', :password => 'admin')
admin.roles << Role.find_or_create_by_title('admin')
SystemPreferences.vpn = {:identifier => Network.local.uuid, :password => ActiveSupport::SecureRandom.base64(10)}

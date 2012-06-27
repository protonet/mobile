SystemPreferences.node_name = SystemPreferences.publish_to_web_name.downcase
SystemPreferences.node_description = "this is your own node"
SystemPreferences.node_supernode = "localhost"
SystemPreferences.node_key  = "encryptme"
SystemPreferences.node_uuid = UUID4R::uuid(1)

FileUtils.mkdir_p(configatron.files_path, :mode => 0770)
FileUtils.mkdir_p("#{configatron.files_path}/users", :mode => 0770)
FileUtils.mkdir_p("#{configatron.files_path}/channels", :mode => 0770)
FileUtils.mkdir_p("#{configatron.files_path}/system_users", :mode => 0770)
`chmod g+s #{configatron.files_path}/channels`
`chmod g+s #{configatron.files_path}/users`
`chmod g+s #{configatron.files_path}/system_users`

Network.local
Node.local
['admin', 'user', 'guest', 'invitee', 'api', 'api-node'].each do |title|
  Role.find_or_create_by_title(title)
end
User.anonymous
Channel.home
admin = User.create(:login => 'admin', :email => 'admin@protonet.local', :password => 'admin')
admin.roles << Role.find_or_create_by_title('admin')
Channel.system
if Rails.env.production?
  admin.subscribe(Channel.support) rescue puts("WARNING: couldn't connect protonet-support channel.")
end
SystemPreferences.vpn = {:identifier => Network.local.uuid, :password => ActiveSupport::SecureRandom.base64(10)}

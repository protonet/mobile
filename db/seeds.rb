SystemPreferences.node_name = SystemPreferences.publish_to_web_name
SystemPreferences.node_description = "this is your own node"
SystemPreferences.node_supernode = "localhost"
SystemPreferences.node_key  = "encryptme"
SystemPreferences.node_uuid = UUID4R::uuid(1)
#  this code is duplicated in the rake task -> dashboard.rake -> reset_admin_key
Network.local
Node.local
['admin', 'user', 'guest', 'invitee', 'api', 'api-node'].each do |title|
  Role.find_or_create_by_title(title)
end
User.anonymous
Channel.home
admin = User.create(:login => 'admin', :email => 'admin@protonet.local', :password => 'admin')
admin.roles << Role.find_or_create_by_title('admin')
if Rails.env.production?
  begin
    support_channel_uuid = "b0138cc6-ffbb-11e0-92ce-0024215f2168"
    Node.couple({:url => "https://team.protonet.info"}).attach_global_channel(support_channel_uuid)
    admin.subscribe(Channel.find_by_uuid(support_channel_uuid))
  rescue
    puts "WARNING: couldn't connect protonet-support channel."
  end
end
SystemPreferences.vpn = {:identifier => Network.local.uuid, :password => ActiveSupport::SecureRandom.base64(10)}

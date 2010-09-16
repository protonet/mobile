class ClientTracker
  attr_accessor :online_users, :remote_users, :channel_users, :open_sockets
  
  def initialize
    @online_users  = Hash.new {|hash, key| hash[key] = {} }
    @remote_users  = {}
    
    @channel_users = {}
    @open_sockets  = []
  end
  
  def add_conn conn
    @open_sockets << conn
  end
  def remove_conn conn
    @open_sockets.reject! {|s| s == conn }
  end
  
  def add_user user, conn
    @online_users[user.id]['name'] ||= user.display_name
    @online_users[user.id]['network_uuid'] ||= Network.local.uuid
    @online_users[user.id]['connections'] ||= []
    @online_users[user.id]['connections'] << [conn.key, conn.type]
  end
  def remove_user user, conn
    return unless user
    
    @online_users[user.id]["connections"].reject! {|key, type| key == conn.key}
    @online_users.delete(user.id) if @online_users[user.id]["connections"].empty?
  end
  
  # TODO: STUPID! STUPID! STUPID!
  def update_remote_users users
    users.each_key do |user_id|
      users[user_id]['network_uuid'] = Network.all[1].uuid # TODO: GAH!!!
    end
    @remote_users = users
  end
  
  def global_users
    @remote_users.merge @online_users # local users take priority
  end
end

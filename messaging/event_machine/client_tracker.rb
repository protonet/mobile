class ClientTracker
  include Rabbit
  attr_accessor :online_users, :channel_users, :remote_users, :remote_channel_users,
                :global_online_users, :global_channel_users, :open_sockets
  
  def initialize
    @online_users  = {}
    @channel_users = {}

    @remote_users  = {}
    @remote_channel_users = {}
    
    @open_sockets  = []
  end
  
  def add_conn conn
    @open_sockets << conn
  end
  
  def remove_conn conn
    @open_sockets.reject! {|s| s == conn }
  end
  
  def add_user user, conn
    @online_users[user.id] = {}
    @online_users[user.id]['id']            ||= user.id
    @online_users[user.id]['name']          ||= user.display_name
    @online_users[user.id]['avatar']        ||= user.avatar.url
    @online_users[user.id]['node_uuid']     ||= Node.local.uuid
    @online_users[user.id]['connections']   ||= []
    @online_users[user.id]['connections'] << [conn.socket_id, conn.type]
  end
  
  def remove_user user, conn
    return unless user
    @online_users[user.id]["connections"] && @online_users[user.id]["connections"].reject! {|socket_id, type| socket_id == conn.socket_id}
    if @online_users[user.id] && @online_users[user.id]["connections"].blank?
      @online_users.delete(user.id) 
      remove_all_channel_subscriptions_for(user.id)
    end
  end
  
  def update_remote_users(node_id, online_userz, remote_channel_userz)
    online_userz          ||= {}
    remote_channel_userz  ||= {}
    users_joined            = []
    remote_users_from_current_node = remote_users_from(node_id)

    user_ids_to_remove = remote_users_from_current_node - online_userz.keys
    user_ids_to_remove = user_ids_to_remove.map do |id|
      generated_user_id = "#{node_id}_#{id}"
      @remote_users.delete(generated_user_id)
      remove_all_channel_subscriptions_for(generated_user_id)
      generated_user_id
    end
    
    user_ids_to_add = online_userz.keys - remote_users_from_current_node
    user_ids_to_add = user_ids_to_add.map do |id|
      generated_user_id = "#{node_id}_#{id}"
      user_data = online_userz[id]
      user_data["id"] = generated_user_id
      @remote_users[generated_user_id] = user_data
      generated_user_id
    end
    
    remote_channel_userz.each do |channel_uuid, user_ids|
      self.remote_channel_users[channel_uuid] ||= []
      self.remote_channel_users[channel_uuid] = self.remote_channel_users[channel_uuid] | user_ids.map do |user_id|
        generated_user_id = "#{node_id}_#{user_id}"
        next if user_id == -1
        generated_user_id
      end.compact
    end
    [user_ids_to_remove, user_ids_to_add]
  end
  
  def remove_remote_users(node_id)
    @remote_users.delete_if {|user_id,v| user_id.match(node_prefix_regexp(node_id))}
    @remote_channel_users.each do |channel_uuid, user_ids|
      if @remote_channel_users[channel_uuid].blank?
        @remote_channel_users.delete(channel_uuid)
      else
        @remote_channel_users[channel_uuid] = @remote_channel_users[channel_uuid].delete_if do |user_id|
          user_id.match(node_prefix_regexp(node_id))
        end
      end
    end
  end
  
  def global_online_users
    @online_users.merge(@remote_users)
  end
  
  def global_channel_users
    @channel_users.merge(@remote_channel_users) do |key, local_channel_userz, remote_channel_userz|
      local_channel_userz | remote_channel_userz
    end
  end
  
  def remote_users_from(node_id)
    @remote_users.map {|id, v| id.match(/^#{node_id}_(.*)/).try(:[], 1)}.compact
  end
  
  def node_prefix_regexp(node_id)
    /^#{node_id}_/
  end
  
  def channel_id_for(uuid)
    @channel_uuid_to_id ||= {}
    @channel_uuid_to_id[uuid] ||= begin
      Channel.find_by_uuid(uuid).try(:id)
    end
  end
  
  def channel_subscriptions_for(channel_ids, resolve_uuids = false)
    result = global_channel_users.reject {|k,v| !channel_ids.include?(k)}
    resolve_uuids ? result.inject({}) {|result, element| result[channel_id_for(element.first)]= element[1]; result} : result
  end
  
  def add_channel_subscription(user_id, channel_uuid)
    channel_users[channel_uuid] ||= []
    channel_users[channel_uuid] = (channel_users[channel_uuid] | [user_id])
  end
  
  def remove_channel_subscription(user_id, channel_uuid)
    channel_users[channel_uuid].delete(user_id)
    channel_users.delete(channel_uuid) if channel_users[channel_uuid].empty?
  end
  
  def remove_all_channel_subscriptions_for(user_id)
    channel_users.each do |channel_uuid, v|
      remove_channel_subscription(user_id, channel_uuid)
    end
  end
  

end

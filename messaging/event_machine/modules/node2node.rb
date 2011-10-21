module Node2Node
  
  def request_remote_avatar(user_id, remote_avatar_url)
    if (url = remote_avatar_url.match(/^(\/system.*)(\?.*)?/).try(:[], 1))
      local_url = url.gsub(/avatars\/.*\/original/, "avatars/#{user_id}/original")
      return local_url if File.exists?("#{Rails.root}/public#{local_url}")
      avatar_filename = remote_avatar_url.match(/original\/(.*)(\?)?/).try(:[], 1)
      return unless avatar_filename
      # todo move to single operation/trigger
      send_json :trigger => "rpc.get_avatar", :operation => "rpc.get_avatar", :avatar_filename => avatar_filename, :user_id => user_id
      nil
    end
  end
  
  def store_remote_avatar(json)
    user_id = remote_user_id(json["user_id"])
    filename  = cleanup_avatar_filename(json["avatar_filename"])
    directory = "#{Rails.root}/public/system/avatars/#{user_id}/original"
    full_path = "#{directory}/#{filename}"
    url       = "/system/avatars/#{user_id}/original/#{filename}"
    FileUtils.mkdir_p(directory)
    open(full_path, 'w') do |f| 
       f << ActiveSupport::Base64.decode64( json["image"] )
    end
    url
  end
  
  def update_remote_users(client_tracker, node_id, socket_key, json)
    users_to_remove, users_to_add = client_tracker.update_remote_users(node_id, json['online_users'], json['channel_users'])
    users_to_remove.each do |user_id|
      json = {
        :id => user_id,
        :trigger    => 'user.goes_offline',
        :socket_id  => socket_key
      }
      publish 'system', 'users', json
    end
    users_to_add.each do |user_id|
      json = {
        :subscribed_channel_ids => client_tracker.global_channel_users.map {|channel_uuid, users| channel_uuid if users.include?(user_id)}.compact,
        :trigger    => 'user.came_online',
        :socket_id  => socket_key
      }.merge(client_tracker.global_online_users[user_id])
      publish 'system', 'users', json
    end
    [users_to_remove, users_to_add]
  end
  
  def update_remote_online_state(remote_user_id, socket_id, json)
    json["id"]          = remote_user_id
    json["socket_id"]   = socket_id
    publish 'system', 'users', json
  end
  
  def send_avatar(json)
    local_user_id = json["user_id"].sub(/[0-9]*_/, '') # match + security cleanup
    avatar_filename = cleanup_avatar_filename(json["avatar_filename"])
    file_path = "#{Rails.root}/public/system/avatars/#{local_user_id}/original/" + avatar_filename
    # image = ActiveSupport::Base64.encode64(open("http://image.com/img.jpg") { |io| io.read })
    image = ActiveSupport::Base64.encode64(File.read(file_path)) rescue nil
    # todo move to single operation/trigger
    send_json(:operation => 'rpc.get_avatar_answer', :trigger => 'rpc.get_avatar_answer', :user_id => local_user_id, :avatar_filename => avatar_filename, :image => image) if image
  end
  
  def remote_user_id(user_id)
    node_id = @node.try(:id) || @user.try(:node_id)
    raise RuntimeError unless node_id
    "#{node_id}_#{user_id}"
  end
  
  def cleanup_avatar_filename(filename)
    filename.match(/[\w]*\.[\w]*/).try(:[], 0) #security cleanup
  end
  
  
end
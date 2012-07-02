module Node2Node
  
  def request_remote_avatar(user_id, remote_avatar_url)
    if (url = (remote_avatar_url.split("?").first))
      local_url = url.gsub(/avatars\/.*\/original/, "avatars/#{user_id}/original")
      return local_url if File.exists?("#{Rails.root}/public#{local_url}")
      avatar_filename = remote_avatar_url.match(/original\/(.*)/).try(:[], 1)
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
    open(full_path, 'wb') do |f| 
       f.write(ActiveSupport::Base64.decode64( json["image"] ))
    end
    url
  end
  
  def update_remote_users(client_tracker, node_id, socket_key, json)
    users_to_remove, users_to_add = client_tracker.update_remote_users(node_id, json['online_users'], json['channel_users'])
    users_to_remove.each do |user_id|
      next unless client_tracker.real_user?(user_id)
      json = {
        :id => user_id,
        :trigger    => 'user.goes_offline',
        :socket_id  => socket_key
      }
      publish 'system', 'users', json
    end
    users_to_add.each do |user_id|
      next unless client_tracker.real_user?(user_id)
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
    if json["avatar"]
      json["avatar"]      = json["avatar"].sub(/\/system\/avatars\/.*\/original/, "/system/avatars/#{remote_user_id}/original")
    end
    json["socket_id"]   = socket_id
    publish 'system', 'users', json
  end
  
  def send_avatar(json)
    local_user_id = json["user_id"].sub(/[0-9]*_/, '') # match + security cleanup
    avatar_filename = cleanup_avatar_filename(json["avatar_filename"])
    file_url = "http://localhost:#{configatron.web_app_port}/system/avatars/#{local_user_id}/original/" + avatar_filename
    log "avatar at #{file_url}"
    file_url = URI.escape(file_url, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))
    file_path = "#{Rails.root}/public/system/avatars/#{local_user_id}/original/" + avatar_filename

    image = begin
      proxy_url     = "http://localhost:#{configatron.nodejs.port}/image_proxy?url=#{file_url}&width=240&height=240&type=.jpg"
      image_request = HTTParty.get(proxy_url, :timeout => 2)
      image_data = if image_request.code.to_s.match(/2../)
        log("sending a proxyied avatar")
        image_request.body
      else
        log("sending a non proxyied avatar since #{proxy_url} failed with #{image_request.code}")
        File.read(file_path)
      end
      ActiveSupport::Base64.encode64(image_data)
    rescue
      nil
    end

    # todo move to single operation/trigger
    send_json(:operation => 'rpc.get_avatar_answer', :trigger => 'rpc.get_avatar_answer', :user_id => local_user_id, :avatar_filename => avatar_filename, :image => image) if image
  end
  
  def remote_user_id(user_id)
    node_id = @node.try(:id) || @user.try(:node_id)
    raise RuntimeError unless node_id
    "#{node_id}_#{user_id}"
  end
  
  def cleanup_avatar_filename(filename)
    filename.match(/\w*/).try(:[], 0) #security cleanup
  end
  
  def avatar_exists?(user_id, avatar_url)
    avatar_basename = File.basename(avatar_url).sub(/\?[0-9]*/, "")
    @remote_avatar_mapping[user_id] && (File.basename(@remote_avatar_mapping[user_id]) == avatar_basename)
  end
  
end
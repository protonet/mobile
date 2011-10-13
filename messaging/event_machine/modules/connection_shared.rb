require 'json'
module ConnectionShared
  attr_accessor :key, :type, :tracker, :queues
  
  def custom_post_initialize
    @tracker.add_conn self
    
    @queues = []
    @channel_queues = {}
    
    @key = rand(100000000)
    log "connected"
  end

  def receive_json(data)
    if data.is_a?(Hash) && data["operation"] == "authenticate"
      log("auth json: #{data["payload"].inspect}")
      if json_authenticate(data["payload"]) && !@subscribed
        @subscribed = true # don't resubscribe
        bind_socket_to_system_queue
        bind_socket_to_user_queues
        add_to_online_users
        send_channel_subscriptions
        refresh_users
        periodical_user_refresh
      else
        send_reload_request # invalid auth
      end
    elsif (@user) && data.is_a?(Hash)
      case data["operation"]
        when /^user\.typing/
          update_user_typing_status(data)
        when 'ping'
          send_ping_answer
        when 'work'
          send_work_request(data)
        when 'remote.meep'
          channel_id = @tracker.channel_id_for(data['channel_uuid'])
          channel_id && Meep.create(:user_id => @user.id,
                  :author => data['author'],
                  :message => data['message'],
                  :text_extension => data['text_extension'],
                  :node_id => @user.node.id,
                  :channel_id => channel_id,
                  :socket_id  => @key)
        when 'rpc.get_avatar'
          if node_connection?
            # image = ActiveSupport::Base64.encode64(open("http://image.com/img.jpg") { |io| io.read })
            local_user_id = data["user_id"].match(/.*_([0-9]*)/).try(:[], 1)
            avatar_filename = data["avatar_filename"].match(/[\w]*\./).try(:[], 0) #security cleanup
            file_path = "#{Rails.root}/public/system/avatars/#{local_user_id}/original/" + avatar_filename
            image = ActiveSupport::Base64.encode64(File.read(file_path)) rescue nil
            send_json(:trigger => 'rpc.get_avatar_answer', :user_id => local_user_id, :avatar_filename => avatar_filename, :image => image) if image
          end
        when 'remote_users.update'
          if node_connection? # remote node
            case data['trigger']
            when 'users.update_status'
              users_to_remove, users_to_add = @tracker.update_remote_users(@user.node_id, data['online_users'], data['channel_users'])
              users_to_remove.each do |user_id|
                data = {
                  :id => user_id,
                  :trigger    => 'user.goes_offline',
                  :socket_id  => @key
                }
                publish 'system', 'users', data
              end
              users_to_add.each do |user_id|
                data = {
                  :subscribed_channel_ids => @tracker.global_channel_users.map {|channel_uuid, users| channel_uuid if users.include?(user_id)}.compact,
                  :trigger    => 'user.came_online',
                  :socket_id  => @key
                }.merge(@tracker.global_online_users[user_id])
                publish 'system', 'users', data
              end
            when 'user.came_online', 'user.goes_offline'
              data["id"] = "#{@user.node_id}_#{data["id"]}"
              data["socket_id"] = @key
              publish 'system', 'users', data
            else
              log "==========>>>>>>>>  #{data.inspect} \n\n\n"
            end
          end
      end
    else
      # play echoserver if request could not be understood
      send_json(data)
    end
  end
  
  def node_connection?
    @user && (@user.node_id != 1)
  end

  def json_authenticate(auth_data)
    return false if auth_data.nil?
    
    type = auth_data['type'] || 'api'
    case type
    
      when 'web', 'api'
        return false if auth_data['user_id'] == 0
        potential_user = begin 
          User.find(auth_data['user_id'])
        rescue ActiveRecord::RecordNotFound
          nil
        end
        @user = potential_user if potential_user && potential_user.communication_token_valid?(auth_data['token'])
        
        if @user
          log("authenticated #{@user.display_name}")
          send_json :trigger => 'socket.update_id', :socket_id => @key
        else
          log("could not authenticate user #{auth_data.inspect}")
          return false
        end
    end # case
    @type = type
  end
  
  def send_reload_request
    send_json :x_target => 'document.location.reload'
  end
  
  def send_reconnect_request
    send_json :trigger => 'socket.reconnect'
  end
  
  def custom_unbind
    log("connection closed")
    @tracker.remove_conn self
    remove_from_online_users
    remove_remote_users
    unbind_queues
    end_periodical_user_refresh
  end
  
  def remove_remote_users
    if node_connection?
      @tracker.remove_remote_users(@user.node_id)
    end
  end

  def add_to_online_users
    @tracker.add_user @user, self
    data = {
      :subscribed_channel_ids => @user.channels.verified.map {|c| c.uuid},
      :trigger => 'user.came_online'
    }.merge(@tracker.online_users[@user.id])
    publish 'system', 'users', data
  end

  def remove_from_online_users
    @tracker.remove_user @user, self
    # send current user as offline if this was his last connection
    if @user && !@tracker.online_users.key?(@user.id)
      data = {
        :id => @user.id,
        :trigger => 'user.goes_offline'
      }
      publish 'system', 'users', data
    end
  end
  
  def refresh_users
    online_users = @tracker.global_online_users
    online_users = online_users.reject {|k,v| k.to_s.match(/^#{@user.node_id}_/)} if node_connection?
    data = {
      :trigger => 'users.update_status',
      :online_users => online_users,
      :channel_users => @tracker.channel_subscriptions_for(@channel_queues.keys)
    }
    send_json data
  end
  
  def periodical_user_refresh
    @periodic_user_refresh = EventMachine::add_periodic_timer( 300 ) { refresh_users }
  end
  
  def end_periodical_user_refresh
    @periodic_user_refresh.try(:cancel)
  end
  
  def send_channel_subscriptions(channel_uuid=nil)
    channel_uuids = (channel_uuid ? [channel_uuid] : @channel_queues.keys)
    send_json :trigger => 'channels.update_subscriptions',
              :data => @tracker.channel_subscriptions_for(channel_uuids)
  end
  
  def update_user_typing_status(data)
    response = {
      :trigger => data["operation"],
      :user_id => @user.id
    }
    response.merge!(
      :channel_id   => data["payload"] && data["payload"]["channel_id"],
      :channel_uuid => data["payload"] && data["payload"]["channel_uuid"]) if data["operation"] == "user.typing"
    send_and_publish 'system', 'users', response
  end

  def send_ping_answer
    send_json :trigger => "socket.ping_received"
  end

  def send_work_request(data)
    data[:user_id] = @user.id
    publish 'worker', '#', data
  end

  def send_and_publish(topic, key, data)
    publish topic, key, data
  end

  def bind_socket_to_system_queue
    bind 'system', '#' do |json|
      log("got system message: #{json.inspect}")
      
      send_json json unless json["socket_id"] == @key
    end
  rescue MQ::Error => e
    log("bind_socket_to_system_queue error: #{e.inspect}")
  end

  def bind_socket_to_user_queues
    @user.channels.verified.each do |channel|
      bind_channel(channel)
      bind_files_for_channel(channel)
      log("subscribing to channel #{channel.id}")
    end
    bind_channel_subscriptions
    bind_user
    @subscribed = true
  end

  def bind_channel(channel)
    uuid = channel.is_a?(Channel) ? channel.uuid : channel
    @channel_queues[uuid] = bind 'channels', uuid do |json|
      sender_socket_id = json['socket_id']
      send_json json if (!sender_socket_id || sender_socket_id.to_i != @key)
    end
    @tracker.add_channel_subscription(@user.id, uuid)
  rescue MQ::Error => e
    log("bind_channel error: #{e.inspect} for #{channel.inspect}")
  end
  
  def unbind_channel(channel_uuid)
    @tracker.remove_channel_subscription(@user.id, channel_uuid)
    queue = @channel_queues.delete(channel_uuid)
    queue.delete if queue
  end
  
  def bind_channel_subscriptions
    bind 'channels', "subscriptions" do |json|
      if json['user_id'] == @user.id
        case json['trigger']
        when 'user.subscribed_channel'
          bind_channel(json['channel_uuid'])
        when 'user.unsubscribed_channel'
          unbind_channel(json['channel_uuid'])
        end
      end
      send_json json
      send_channel_subscriptions(json['channel_uuid'])
    end
  rescue MQ::Error => e
    log("bind_channel_subscriptions error: " + e.inspect)
  end

  def bind_files_for_channel(channel)
    bind 'files', 'channel', channel.uuid do |json|
        send_json json
    end
  rescue MQ::Error => e
    log("bind_files_for_channel error: " + e.inspect)
  end

  def bind_user
    bind 'users', @user.id do |json|
      send_json json
    end
  rescue MQ::Error => e
    log("bind_user error: " + e.inspect)
  end
  
  def web?;  @type == 'web';  end
  def api?;  @type == 'api';  end
  
  def queue_id; "consumer-#{@key}"; end
  def to_s; @key; end
end

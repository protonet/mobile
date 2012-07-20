require 'json'
require File.join(File.dirname(__FILE__), 'node2node')

module ConnectionShared
  include Node2Node

  attr_accessor :socket_id, :type, :tracker, :queues, :user
  
  def custom_post_initialize
    @tracker.add_conn self
    
    @queues = []
    @channel_queues = {}
    @channel_file_queues = {}
    @remote_avatar_mapping = {}
    
    @socket_id = rand(100000000)
    log "connected"
  end

  def receive_json(json)
    return unless json.is_a? Hash
    
    if json["operation"] == "authenticate"
      log("auth json: #{json["payload"].inspect}")
      if json_authenticate(json["payload"]) && !@subscribed
        @subscribed = true # don't resubscribe
        bind_socket_to_system_queue
        bind_socket_to_user_queues
        add_to_online_users
        refresh_users
        periodical_user_refresh
      else
        send_reload_request # invalid auth
      end
    elsif @user
      case json["operation"]
        when /^user\.typing/
          update_user_typing_status(json)
        when 'meep.create'
          create_meep(json)
        when 'ping'
          send_ping_answer
        when 'remote.meep'
          channel_id = @tracker.channel_id_for(json['channel_uuid'])
          user_id = remote_user_id(json['user_id'])
          
          unless avatar_exists?(user_id, json["avatar"])
            @remote_avatar_mapping[user_id] = request_remote_avatar(user_id, json["avatar"])
          end

          channel_id && Meep.create(:user_id => @user.id,
                  :author => json['author'],
                  :message => json['message'],
                  :text_extension => json['text_extension'] .to_json,
                  :node_id => @user.node.id,
                  :channel_id => channel_id,
                  :socket_id  => @socket_id,
                  :remote_user_id => user_id,
                  :avatar => @remote_avatar_mapping[user_id] || configatron.default_avatar)
        when 'rpc.get_avatar'
          send_avatar(json) if node_connection?
        when 'rpc.get_avatar_answer'
          @remote_avatar_mapping[remote_user_id(json['user_id'])] = store_remote_avatar(json)
        when 'remote_users.update'
          if node_connection? # remote node
            case json['trigger']
            when 'users.update_status'
              update_remote_users(@tracker, @user.node_id, @socket_id, json)
            when 'user.came_online', 'user.goes_offline'
              update_remote_online_state("#{@user.node_id}_#{json["id"]}", @socket_id, json)
            else
              log "==========>>>>>>>>  #{json.inspect} \n\n\n"
            end
          end
          
        else
          # Experimental RPC interface
          object, method = json['operation'].split('.')
          
          begin
            @tracker.rpc.invoke object, method, json['params'], @user do |err, result|
              if err
                send_json json.merge(:status => 'error', :error => err)
              else
                send_json json.merge(:status => 'success', :result => result)
              end
            end
          # Handle any possible errors
          rescue Rpc::RpcError => ex
            puts "Error during RPC call: #{ex.class}", ex.message, ex.backtrace
            # Send some info on the error that occured
            send_rpc_error json.merge(:status => 'error', :error => ex.class.to_s)
          end
      end
    else
      # play echoserver if request could not be understood
      puts "Something is using an obsolete interface! #{json.inspect}"
      send_json(json)
    end
  end
  
  def send_rpc_error(json={})
    send_json json.merge(:status => 'error')
  end
  
  def node_connection?
    @user && (@user.node_id != 1)
  end

  def json_authenticate(auth_data)
    return false if auth_data.nil?
    
    type = auth_data['type'] || 'api'
    case type
    
      when 'web', 'api', 'node'
        return false if auth_data['user_id'] == 0
        potential_user = User.find_by_id(auth_data['user_id'])
        @user = potential_user if potential_user && potential_user.communication_token_valid?(auth_data['token'])
        
        if @user
          log("authenticated #{@user.display_name}")
          send_json :trigger => 'socket.update_id', :socket_id => @socket_id
        else
          log("could not authenticate user #{auth_data.inspect}")
          return false
        end
    end # case
    @type = type
  end
  
  def create_meep(data)
    meep_data = data['payload'].reject {|k,v| !Meep.valid_attributes.include?(k) }
    
    channel   = Channel.find(meep_data['channel_id'])
    response  = { :trigger => 'meep.created', :seq => data['seq'] }
    
    send_json response.merge(:status => 'error') unless @user.subscribed?(channel)
    
    share_attached_files meep_data do |err, meep_data|
      next send_json(response.merge(:status => 'error', :error => err)) if err
      
      meep = Meep.create(meep_data.merge(:user => @user, :channel => channel))
      
      if meep
        send_json response.merge(:status => 'success', :result => Meep.prepare_for_frontend(meep, :channel_id => channel.id))
      else
        send_json response.merge(:status => 'error')
      end
    end
  end
  
  def share_attached_files(meep_data, &block)
    text_extension = meep_data['text_extension']
    
    # TODO:
    # Parse message:
    # => find urls to files and share them in the current channel folder
    # => change message
    return block.call(false, meep_data) if !text_extension || !text_extension['files']
    
    @tracker.rpc.invoke 'fs', 'share', { 'from' => text_extension['files'], 'to' => "/channels/#{meep_data['channel_id']}/" }, @user do |err, result|
      unless err
        text_extension['files'] = text_extension['files'].map { |path| result[path] || path }
        meep_data['text_extension'] = text_extension
      end
      block.call(err, meep_data)
    end
  end
  
  def send_reload_request
    send_json :eval => 'location.reload()'
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
    if @tracker.real_user?(@user.id)
      @user.save_online_status
      data = {
        :subscribed_channel_ids => @user.channels.verified.map {|c| c.uuid},
        :trigger => 'user.came_online'
      }.merge(@tracker.online_users[@user.id])
      publish 'system', 'users', data
    end
  end

  def remove_from_online_users
    @tracker.remove_user @user, self
    # send current user as offline if this was his last connection
    if @user && !@tracker.online_users.key?(@user.id)
      @user.save_offline_status
      data = {
        :id => @user.id,
        :trigger => 'user.goes_offline'
      }
      publish 'system', 'users', data
    end
  end
  
  def refresh_users
    channel_users = @tracker.channel_subscriptions_for(@channel_queues.keys)
    all_users_in_subscribed_channels = channel_users.map {|k,v| v}.flatten.uniq
    online_users  = @tracker.global_online_users
    online_users  = online_users.reject {|id, user| id.to_s.match(/^#{@user.node_id}_/) } if node_connection?
    online_users  = online_users.reject {|id, user| !all_users_in_subscribed_channels.include?(id)}
    online_users  = online_users.reject {|id, user| !@tracker.real_user?(id) }
    data = {
      :trigger => 'users.update_status',
      :online_users => online_users,
      :channel_users => channel_users
    }
    send_json data
  end
  
  def periodical_user_refresh
    @periodic_user_refresh = EventMachine::add_periodic_timer( 300 ) { refresh_users }
  end
  
  def end_periodical_user_refresh
    @periodic_user_refresh.try(:cancel)
  end
  
  def publish_channel_subscriptions(channel_uuid)
    publish 'channels', channel_uuid, :trigger => 'channels.update_subscriptions',
              :data => @tracker.channel_subscriptions_for([channel_uuid])
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

  def send_and_publish(topic, key, data)
    publish topic, key, data
  end

  def bind_socket_to_system_queue
    bind 'system', '#' do |json|
      log("got system message: #{json.inspect}")
      
      send_json json if @socket_id && json["socket_id"] != @socket_id
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
      send_json json if (!sender_socket_id || sender_socket_id.to_i != @socket_id)
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
          bind_files_for_channel(json['channel_uuid'])
        when 'user.unsubscribed_channel'
          unbind_channel(json['channel_uuid'])
          unbind_files_for_channel(json['channel_uuid'])
        end
        publish_channel_subscriptions(json['channel_uuid'])
      end
      send_json json
    end
  rescue MQ::Error => e
    log("bind_channel_subscriptions error: " + e.inspect)
  end

  def bind_files_for_channel(channel)
    uuid = channel.is_a?(Channel) ? channel.uuid : channel
    @channel_file_queues[uuid] = bind 'files', 'channel', uuid do |json|
      send_json json
    end
  rescue MQ::Error => e
    log("bind_files_for_channel error: " + e.inspect)
  end
  
  def unbind_files_for_channel(channel_uuid)
    queue = @channel_file_queues.delete(channel_uuid)
    queue.delete if queue
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
  
  def queue_id; "consumer-#{@socket_id}"; end
  def to_s; @socket_id; end
end

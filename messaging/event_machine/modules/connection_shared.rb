module ConnectionShared
  attr_accessor :key, :type, :tracker, :queues
  
  def post_init
    super
    @tracker.add_conn self
    
    @queues = []
    
    @key = ActiveSupport::SecureRandom.base64(10)
    log "connected"
  end

  def receive_json(data)
    if data.is_a?(Hash) && data["operation"] == "authenticate"
      log("auth json: #{data["payload"].inspect}")
      if json_authenticate(data["payload"]) && !@subscribed
        @subscribed = true # don't resubscribe
        bind_socket_to_system_queue
        
        if !node? # normal handling if you're not a node
          bind_socket_to_user_queues
          add_to_online_users
          send_channel_subscriptions
          
        elsif data['channels'] # List of certain channels?
          data['channels'].each do |uuid|
            channel = Channel.find_by_uuid uuid
            
            bind_channel(channel)
            bind_files_for_channel(channel)
            log("subscribing to channel #{channel.uuid}")
          end
          
        else # No list. Auto-subscribe to all global channels
          log 'subscribing to all global channels'
          Channel.global.each do |channel|
            bind_channel(channel)
            bind_files_for_channel(channel)
            log("subscribing to channel #{channel.uuid}")
          end
        end
      else
        send_reload_request # invalid auth
      end
      
    elsif (@user || node?) && data.is_a?(Hash)
      case data["operation"]
        
        when /^user\.typing/
          update_user_typing_status(data["operation"])
          
        when 'ping'
          send_ping_answer
          
        when 'work'
          send_work_request(data)
        
        when 'network.probe'
          log "Pulling channel list off #{data['supernode']}"
          network = Network.new :supernode => data['supernode']
          
          send_json :trigger   => 'network.probe',
                    :supernode => data['supernode'],
                    :channels  => network.get_channels
        
        when 'network.create'
          log "Coupling with #{data['supernode']}"
          
          network = Network.new :name => data['name'],
                                :description => data['description'],
                                :supernode => data['supernode']
          
          send_json :trigger     => 'network.creating',
                    :message     => 'Probing remote node...'
          
          info = network.negotiate
          
          send_json :trigger     => 'network.creating',
                    :message     => 'Creating local entry for remote node...'
          
          network.save
          
          send_json :trigger     => 'network.creating',
                    :message     => 'Importing channels...'
          
          data['channels'].each do |uuid|
            chan = info['channels'][uuid]
            
            send_json :trigger     => 'network.creating',
                      :message     => 'Importing channel: ' + chan['name']
            
            Channel.create :name => chan['name'],
              :description => chan['description'],
              :uuid => uuid,
              :owner_id => 0,
              :network_id => network.id
          end
          
          send_json :trigger     => 'network.creating',
                    :message     => 'Initiating persistant connection...'

          NodeConnection.connect network, @tracker, info['config']['socket_server_host'], info['config']['socket_server_port']
          
          send_json :trigger     => 'network.create',
                    :id          => network.id,
                    :name        => data['name'],
                    :description => data['description'],
                    :supernode   => data['supernode'],
                    :channels    => data['channels']
        
        when 'meep'
          # TODO: Use a helper or *something*
          
          if node?
            channel = Channel.find_by_uuid data['channel_uuid']
            meep = Meep.create :user_id => 0,
              :author => data['author'],
              :message => data['message'],
              :text_extension => data['text_extension'],
              :network_id => @node.id, # TODO: un-hardcode
              :channels => [channel]
              
          else
            if data['channel_uuid']
              channel = Channel.find_by_uuid data['channel_uuid']
            else
              channel = Channel.find_by_id data['channel_id']
            end
            meep = Meep.create :user_id => @user.id,
              :author => @user.display_name,
              :message => data['message'],
              :text_extension => data['text_extension'],
              :network_id => 1,
              :channels => [channel]
          end
          
      end
      
    else
      # play echoserver if request could not be understood
      send_json(data)
    end
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
      
      when 'node'
        potential_node = Network.find_by_uuid(auth_data['uuid']) rescue nil
        @node = potential_node if potential_node && potential_node.key == auth_data['key']
        
        if @node
          log("authenticated node #{@node.name}")
          send_json :x_target => 'authenticate', :key => @key
        else
          log("could not authenticate node #{auth_data.inspect}")
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
  
  def unbind
    log("connection closed")
    @tracker.remove_conn self
    remove_from_online_users # TODO: remove_conn should be do this
    unbind_queues
  end

  def add_to_online_users
    @tracker.add_user @user, self
    refresh_users
  end

  def remove_from_online_users
    @tracker.remove_user @user, self
    refresh_users
  end
  
  def refresh_users
    data = {
      :online_users => @tracker.global_users,
      :trigger => 'users.update_status'
    }
    send_and_publish 'system', 'users', data
    # FIXME: Dunno why but we've to send the data to the current user again
    # because it sometimes doesn't reach him (we've to investigate)
    # send_json(data)
  end
  
  def fill_channel_users
    @tracker.channel_users = {}
    Channel.all.each do |channel|
      @tracker.channel_users[channel.id] = channel.users(true).collect {|u| u.id}
    end
  end
  
  def send_channel_subscriptions
    fill_channel_users
    filtered_channel_users = {}
    @user.verified_channels.each do |channel|
      filtered_channel_users[channel.id] = @tracker.channel_users[channel.id]
    end
    
    send_json :trigger => 'channels.update_subscriptions',
              :data => filtered_channel_users
  end
  
  def update_user_typing_status(operation)
    send_and_publish 'system', 'users',
      :trigger => operation,
      :user_id => @user.id
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
      
      send_json json
    end
  end

  def bind_socket_to_user_queues
    @user.verified_channels.each do |channel|
      bind_channel(channel)
      bind_files_for_channel(channel)
      log("subscribing to channel #{channel.id}")
    end
    
    bind_user
    @subscribed = true
  end

  def bind_channel(channel)
    bind 'channels', channel.uuid do |json|
      # TODO: This should not be here see unbind_channel which should be implemented differently
      unless unbound_channels.include?(json['channel_uuid'].to_s)
        sender_socket_id = json['socket_id']
        send_json json if !sender_socket_id || sender_socket_id != @key
      end
    end
  end
  
  # TODO: clean that up and make it work, check bind_channel for connected todo
  def unbind_channel(channel)
    unbound_channels.push(channel.uuid.to_s)
  end
  
  def unbound_channels
    @unbound_channels ||= []
  end
  
  def bind_files_for_channel(channel)
    bind 'files', 'channel', channel.uuid do |json|
      send_json json
    end
  end

  def bind_user
    bind 'users', @user.id do |json|
      send_json json
    end
  end
  
  def web?;  @type == 'web';  end
  def api?;  @type == 'api';  end
  def node?; @type == 'node'; end
  
  def queue_id; "consumer-#{@key}"; end
  def to_s; @key; end
end

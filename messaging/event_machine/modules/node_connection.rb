require 'uri'

require File.join(File.dirname(__FILE__), 'flash_connection')

class NodeConnection < FlashConnection
  include Rabbit
  
  attr_accessor :node, :tracker

  class << self
    def log message
      puts message
    end

    def connect(node, tracker)
      uri = URI.parse node.url
      host = uri.host
      port = 5000
      EventMachine.next_tick do
        conn = EventMachine.connect host, port, NodeConnection, node, tracker
      end
    end
    
  end
  
  def initialize(node, tracker)
    super()
    
    @node = node
    @tracker = tracker
    
    @channel_uuids = []
    @channel_id    = []
    @remote_avatar_mapping = {}
    
    @tracker.add_node(@node, self)
  end
  
  def post_init
    "trying connection to #{@node.uuid}"
  end
  
  def connection_completed
    log "connected to remote node #{@node.uuid} authenticating..."
    
    Channel.all(:conditions => {:node_id => @node.id}).each do |channel|
      bind_channel(channel)
    end
    bind_system_queue
    remote_user     = @node.remote_api.find_user(@node.api_user_id)
    token           = remote_user.communication_token
    @remote_node_id = remote_user.node_id
    
    send_json :operation => 'authenticate',
              :payload => {:type => 'web', :user_id => @node.api_user_id, :token => token}
    
    periodic_ping
    send_connected_message
    refresh_users
    periodical_user_refresh
  rescue => ex
    p ex, ex.backtrace
  end
  
  def from_this_node(user_id)
    user_id.to_s.match(/#{@node.id}_/)
  end
  
  def refresh_users
    channel_users = @tracker.client_tracker.global_channel_users.reject {|k,v| !@channel_uuids.include?(k)}
    channel_users = channel_users.each {|c_uuid, user_ids| channel_users[c_uuid] = user_ids.map {|u_id| u_id unless from_this_node(u_id)}.compact}
    user_ids      = channel_users.map {|k,v| v}.flatten.uniq
    online_users  = @tracker.client_tracker.global_online_users.reject {|k,v| !user_ids.include?(k)}
    send_json :operation      => 'remote_users.update',
              :channel_users  => channel_users,
              :online_users   => online_users,
              :trigger        => "users.update_status"
  end
  
  def periodical_user_refresh
    @periodic_user_refresh ||= EventMachine::add_periodic_timer( 15 ) { refresh_users }
  end
  
  def periodic_ping
    @ping ||= EventMachine.add_periodic_timer 30 do
      log "sending ping"
      send_json :operation => 'ping'
    end
  end
  
  def unbind
    log "unbind"
    @tracker.client_tracker.remote_users.each do |user_id, user_data|
      data = {
        :id => user_id,
        :trigger => 'user.goes_offline',
        :remote  => @node.id
      }
      publish 'system', 'users', data
    end
    @tracker.client_tracker.remove_remote_users(@node.id)
    
    @tracker.remove_node(@node)
    EventMachine::cancel_timer @ping
    EventMachine::cancel_timer @periodic_user_refresh
    unbind_queues
    send_disconnected_message
    EventMachine::add_timer(30) {
      NodeConnection.connect @node, @tracker
    }
  end
  
  def receive_json(json)
    log "Received JSON: #{json.inspect}"
    
    case json['trigger']
      when 'meep.receive'
        return if json['node_uuid'] == Node.local.uuid
      
        channel = Channel.find_by_uuid(json['channel_uuid'])
        json['channel_id'] = channel.id
        json['node_uuid'] = @node.uuid
        user_id = remote_user_id(json["user_id"])
        
        Meep.create :user_id => -1,
          :author => json['author'],
          :message => json['message'],
          :text_extension => json['text_extension'].to_json,
          :node_id => @node.id,
          :channel_id => channel.id,
          :remote_user_id => user_id,
          :avatar => @remote_avatar_mapping[user_id] || configatron.default_avatar
      when 'channels.update_subscriptions'
        json["data"].each do |channel_uuid, user_ids|
          user_ids = user_ids.map {|user_id| remote_user_id(user_id)}
          if remote_channel_users = @tracker.client_tracker.remote_channel_users[channel_uuid]
            @tracker.client_tracker.remote_channel_users[channel_uuid] = (remote_channel_users | user_ids)
          else
          @tracker.client_tracker.remote_channel_users[channel_uuid] = user_ids
          end
        end
      when 'users.update_status'
        users_to_remove, users_to_add = @tracker.client_tracker.update_remote_users(@node.id, json['online_users'], json['channel_users'])
        users_to_remove.each do |user_id|
          data = {
            :id => user_id,
            :trigger => 'user.goes_offline',
            :remote  => @node.id
          }
          publish 'system', 'users', data
        end
        users_to_add.each do |user_id|
          data = {
            :subscribed_channel_ids => @tracker.client_tracker.channel_users.map {|channel_uuid, users| channel_uuid if users.include?(user_id)}.compact,
            :trigger => 'user.came_online',
            :remote  => @node.id
          }.merge(@tracker.client_tracker.remote_users[user_id])
          publish 'system', 'users', data
        end
        users_to_add.each do |user_id|
          request_user_avatar(user_id, @tracker.client_tracker.remote_users[user_id]["avatar"])
        end
      when 'user.came_online', 'user.goes_offline'
        unless json["id"].to_s.match(/#{@remote_node_id}_/)
          json["id"]      = remote_user_id(json["id"])
          json["remote"]  = @node.id
          publish 'system', 'users', json
        end
      when 'rpc.get_avatar_answer'
        user_id = remote_user_id(json["user_id"])
        filename  = json["avatar_filename"].match(/[\w]*\./).try(:[], 0) #security cleanup
        directory = "#{Rails.root}/public/system/avatars/#{user_id}/original"
        full_path = "#{directory}/#{filename}"
        url       = "/system/avatars/#{user_id}/original/#{filename}"
        FileUtils.mkdir_p(directory)
        open(full_path, 'w') do |f| 
           f << ActiveSupport::Base64.decode64( json["image"] )
        end
        @remote_avatar_mapping[user_id] = url
    end
  end
  
  def request_user_avatar(user_id, remote_avatar_url)
    if (url = remote_avatar_url.match(/^(\/system.*)\?.*/).try(:[], 1)) && !File.exists?("#{Rails.root}/public#{url}")
      avatar_filename = remote_avatar_url.match(/original\/(.*)\?/).try(:[], 1)
      return unless avatar_filename
      send_json :operation => "rpc.get_avatar", :avatar_filename => avatar_filename, :user_id => user_id
    end
  end
  
  def bind_channel(channel)
    @channel_ids ||= []
    @channel_uuids ||= []
    bind('channels', channel.uuid) do |json|
      if json['node_id'] == Node.local.id
        json['operation'] = 'remote.meep'
        json.delete 'channel_id' # worthless to the remote
        send_json json
      end
    end
    @channel_ids   << channel.id
    @channel_uuids << channel.uuid
    log "bound to channel #{channel.uuid}"
  end
  
  def bind_system_queue
    bind('system', 'users') do |json|
      case json['trigger']
      when 'user.came_online'
        data = {
            :trigger    => json['trigger'],
            :operation  => 'remote_users.update',
            :subscribed_channel_ids => (json['subscribed_channel_ids'] & (@channel_uuids || []))
        }.merge(@tracker.client_tracker.online_users[json['id']] || {})
        send_json(data) if json['remote'] != @node.id
      when 'user.goes_offline'
        data = {
            :trigger    => json['trigger'],
            :operation  => 'remote_users.update',
            :id         => json['id']
        }
        send_json(data) if json['remote'] != @node.id
      end
    end
  end
  
  def send_connected_message
    publish "system", "#", {
      :trigger      => "node.connected",
      :node_id      => @node.id,
      :node_uuid    => @node.uuid
    }
  end
  
  def send_disconnected_message
    publish "system", "#", {
      :trigger    => "node.disconnected",
      :node_id      => @node.id,
      :node_uuid    => @node.uuid
    }
  end

  def queue_id
    "node-#{@node.id}"
  end
  
  def remote_user_id(user_id)
    "#{@node.id}_#{user_id}"
  end

  # TODO: redundant code
  def to_s 
    "node connection #{@node.id || 'uncoupled'}"
  end
end
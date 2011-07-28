class ClientTracker
  include Rabbit
  attr_accessor :online_users, :remote_users, :channel_users, :open_sockets
  
  def initialize
    @online_users  = Hash.new {|hash, key| hash[key] = {} }
    @remote_users  = {}
    
    @channel_users = {}
    @open_sockets  = []
    
    track_new_subscriptions
  end
  
  def track_new_subscriptions
    bind 'channels', "#" do |json|
      begin
        user_id = json["user_id"]
        channel_id = json["channel_id"]
        case json["trigger"]
        when "user.unsubscribed_channel"
          puts("\n\n\n=======================>>>>>> #{json["user_id"]} #{json["channel_id"]} UNSUB\n\n\n")
          @online_users[user_id.to_i]['connections'].each do |connection|
            socket = @open_sockets.find {|socket| socket.key == connection[0]}
            socket.unbind_channel(Channel.find(channel_id))
            # socket.send_json({})
            socket.send_json :x_target => 'document.location.reload'
          end
        when "user.subscribed_channel"
          puts("\n\n\n=======================>>>>>> #{json["user_id"]} #{json["channel_id"]} SUB\n\n\n")
          @online_users[user_id.to_i]['connections'].each do |connection|
            socket = @open_sockets.find {|socket| socket.key == connection[0]}
            socket.bind_channel(Channel.find(channel_id))
            # socket.send_json({})
            socket.send_json :x_target => 'document.location.reload'
          end
        end
      rescue => ex
        puts "ERROR!! on subscription tracking! #{ex.inspect}"
      end
    end
  end
  
  def add_conn conn
    @open_sockets << conn
  end
  def remove_conn conn
    @open_sockets.reject! {|s| s == conn }
  end
  
  def add_user user, conn
    @online_users[user.id]['id']            ||= user.id
    @online_users[user.id]['name']          ||= user.display_name
    @online_users[user.id]['avatar']        ||= user.avatar.url
    @online_users[user.id]['external_profile_url'] ||= user.external_profile_url
    @online_users[user.id]['network_uuid']  ||= Network.local.uuid
    @online_users[user.id]['connections']   ||= []
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

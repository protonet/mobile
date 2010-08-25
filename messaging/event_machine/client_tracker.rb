class ClientTracker
  attr_accessor :online_users, :channel_users, :open_sockets
  
  def initialize
    @online_users  = Hash.new {|hash, key| hash[key] = {} }
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
    @online_users[user.id]['name'] ||= @user.display_name
    @online_users[user.id]['connections'] ||= []
    @online_users[user.id]['connections'] << [conn.key, conn]
  end
  def remove_user user, conn
    return unless user
    
    @online_users[@user.id]["connections"].reject! {|key, type| type == conn}
    @online_users.delete(@user.id) if @online_users[@user.id]["connections"].empty?
  end
end

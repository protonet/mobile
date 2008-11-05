class ChatUsers < Application

  def index
    room = ChatRoom.get(params[:room_id])
    messages = room.users.all
    render '[' + messages.map{|m| m.attributes.to_json }.join(',') + ']', :layout => false
  end
  
end

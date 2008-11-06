class ChatUsers < Application

  def index
    room = ChatRoom.get(params[:room_id])
    render room.users.to_json, :layout => false
  end
  
end

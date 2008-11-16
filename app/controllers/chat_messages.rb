class ChatMessages < Application

  def index
    room = ChatRoom.get(params[:room_id])
    render room.messages.to_json, :layout => false
  end

  def create
    throw(:halt, "error wrong user_id sent") unless params[:user_id] && params[:user_id].to_i == current_user.id
    room = ChatRoom.get(params[:room_id])
    message = ChatMessage.new(:user_id => params[:user_id], :text => params[:text])
    room.messages << message
    room.save
    render message.id.to_s, :layout => false
  end
  
end

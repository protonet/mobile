class ChatMessages < Application

  def index
    room = Room.get(params[:room_id])
    messages = @room.messages.all
    render '[' + messages.map{|m| m.attributes.to_json }.join(',') + ']', :layout => false
  end

  def create
    throw(:halt, "error wrong user_id sent") unless params[:user_id] && params[:user_id].to_i == current_user.id
    @room = Room.get(params[:room_id])
    message = ChatMessage.new(:user_id => params[:user_id], :text => params[:text])
    @room.messages << message
    @room.save
    render message.id.to_s, :layout => false
  end
  
end

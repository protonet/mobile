class ChatMessages < Application

  def index
    received_message_ids = params[:received_message_ids] || []
    @room = Room.get(params[:room_id])
    @unreceived_messages = @room.messages.all(:conditions => [ 'id NOT IN ?', received_message_ids ])
    render '[' + @unreceived_messages.map{|m| m.attributes.merge({:user_name => m.user.login}).to_json }.join(',') + ']', :layout => false
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

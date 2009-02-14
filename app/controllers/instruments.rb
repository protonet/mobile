class Instruments < Application
  
  def index
    @lobby = ChatRoom.lobby
    current_user.join_room(@lobby)
    @token = current_user.id
    render
  end
    
end

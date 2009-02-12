class Instruments < Application
  
  
  # ...and remember, everything returned from an action
  # goes to the client...
  def index
    @lobby = ChatRoom.lobby
    @token = current_user.id
    render
  end
    
end

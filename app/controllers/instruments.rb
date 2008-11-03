class Instruments < Application
  
  
  # ...and remember, everything returned from an action
  # goes to the client...
  def index
    @lobby = ChatRoom.lobby
    render
  end
    
end

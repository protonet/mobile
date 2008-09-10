class Instruments < Application
  
  
  # ...and remember, everything returned from an action
  # goes to the client...
  def index
    @lobby = Room.lobby
    render
  end
    
end

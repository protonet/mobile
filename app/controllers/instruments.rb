class Instruments < Application
  
  
  # ...and remember, everything returned from an action
  # goes to the client...
  def index
    render '<h1 style="color:white;">yay!</h1>'
  end
    
end

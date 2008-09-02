class Users < Application

  # ...and remember, everything returned from an action
  # goes to the client...
  def index
    render
  end
  
  def create
    User.create(:name => params[:name], :password => params[:password])
    redirect url(:controller => 'dashboard', :action => :index)
  end
  
end

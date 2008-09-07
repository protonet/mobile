class Users < Application

  skip_before :login_required
  
  def create
    if User.create(:login => params[:login], :password => params[:password], :password_confirmation => params[:password_confirmation])
      
    end
    redirect url(:controller => 'dashboard', :action => :index)
  end
  
end

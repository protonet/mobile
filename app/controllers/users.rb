class Users < Application

  skip_before :login_required
  
  def new
    p 'new'
    @user = User.new
    render :layout => 'logged_out'
  end
  
  def create
    @user = User.new(params[:user] || {})
    if @user.save(:create)
      self.current_user = @user
      redirect(url(:controller => 'instruments', :action => :index))
    else
      debugger
      render :new, :layout => 'logged_out'
    end
  end
  
  def show
    login_required
    @user = User.get(params[:id])
    redirect(url(:home)) unless @user
    render
  end
  
end

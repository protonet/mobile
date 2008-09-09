class Users < Application

  skip_before :login_required
  
  def new
    @user = User.new
  end
  
  def create
    @user = User.new(params[:user])
    if @user.save
      current_user = @user
      redirect(url(:controller => 'instruments', :action => :index))
    else
      render :new
    end
  end
  
end

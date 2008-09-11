class Users < Application

  skip_before :login_required
  
  def new
    @user = User.new
  end
  
  def create
    @user = User.new(params[:user])
    puts '-------------------->' + @user.inspect
    if @user.save
      self.current_user = @user
      redirect(url(:controller => 'instruments', :action => :index))
    else
      render :new
    end
  end
  
end

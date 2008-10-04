class Sessions < Application

  skip_before :login_required

  def new
    prepare_connected_users
    render
  end

  def create
    user = User.authenticate(params[:user]) if params[:user]
    Merb.logger.info(user.inspect)
    self.current_user = user if user 
    if logged_in?
      if params[:remember_me] == "1"
        current_user.remember_me
        cookies[:auth_token] = { :value => self.current_user.remember_token , :expires => self.current_user.remember_token_expires_at.to_time }
      end
      redirect url(:home)
    else
      redirect(url(:login), :message => {:error => 'Login oder Passwort falsch!'})
    end
  end

  def destroy
    # move to Application
    # self.current_user.forget_me if logged_in?
    # cookies.delete :auth_token
    # reset_session
    # redirect_back_or_default('/')
    # login is required to log you out
    login_required
    log_out!
    redirect url(:home)
  end
  
  private
    def prepare_connected_users
      @connected_users = User.all_connected_users
    end
    
end

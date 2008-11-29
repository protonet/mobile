class Sessions < Application

  skip_before :login_required

  def create
    unless request.post?
      prepare_connected_users
      render :layout => 'logged_out'
    else
      (user = User.authenticate(params[:user])) && self.current_user = user if params[:user]
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
  end

  def destroy
    # you need to have a session before you can destroy it
    login_required
    log_out!
    redirect url(:login)
  end
  
  private
    def prepare_connected_users
      @connected_users = User.all_connected_users
    end
    
end

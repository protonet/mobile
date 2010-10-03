# This controller handles the login/logout function of the site.  
class SessionsController < ApplicationController

  # render new.rhtml
  def new
  end

  def create
    logout_keeping_session!
    user = User.authenticate(params[:login], params[:password])

    if user
      # Protects against session fixation attacks, causes request forgery
      # protection if user resubmits an earlier form using back
      # button. Uncomment if you understand the tradeoffs.
      # reset_session
      self.current_user = user
      # auto set remember me... we might need to change that back sometime later
      params[:remember_me] = "1"
      new_cookie_flag = (params[:remember_me] == "1")
      handle_remember_cookie! new_cookie_flag
      redirect_back_or_default('/')
      flash[:notice] = "Logged in successfully"
    else
      note_failed_signin
      @login       = params[:login]
      @remember_me = params[:remember_me]
      redirect_back_or_default('/')
    end
  end
  
  def create_token
    user = User.authenticate(params[:login], params[:password])
    respond_to do |format|
      format.json do
        if user
          self.current_user = user
          render :json => {:user_id => user.id.to_s, :token => user.communication_token, :authenticity_token => form_authenticity_token}
        else
          render :json => {:user_id => "0", :token => ''}
        end
      end
      format.html { render :text => '' }
    end
  end

  def destroy
    logout_killing_session!
    flash[:notice] = "You have been logged out."
    redirect_back_or_default('/')
  end

protected
  # Track failed login attempts
  def note_failed_signin
    flash[:error] = "Couldn't log you in as '#{params[:login]}'"
    logger.warn "Failed login for '#{params[:login]}' from #{request.remote_ip} at #{Time.now.utc}"
  end
end

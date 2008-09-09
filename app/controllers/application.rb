class Application < Merb::Controller

  before :login_required
  
  def login_required
    try_to_login
    logged_in? || throw(:halt, :access_denied)
  end
  
  def logged_in?
    @current_user != nil
  end
  
  def current_user
    @current_user
  end
  
  def current_user=(user)
    @current_user = user
    session[:user] = user.id
  end
  
  def access_denied
    redirect(url(:login), :message => { :error => 'Bitte einloggen oder einen neuen User anlegen (kostenlos, keine Daten notwendig!).' })
  end
  
  private
  def try_to_login
    Merb.logger.info("trying to login #{@current_user}")
    @current_user ||= (login_from_session || login_from_cookie)
    if @current_user
      session[:user] = @current_user.id
      Merb.logger.info("User #{@current_user.login} logged in!")
    end
  end
  
  def login_from_session
    @current_user = User.get(session[:user]) if session[:user]
  end
  
  def login_from_cookie
    nil #not implemented
  end
  
end
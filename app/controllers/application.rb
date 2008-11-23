class Application < Merb::Controller

  before :login_required
  
  def login_required
    try_to_login
    logged_in? || throw(:halt, :access_denied)
  end
  
  
  
  def current_user=(user)
    # log me out properly if setting user with nil
    log_out! if @current_user && user.nil?
    # basically logging you in
    @current_user   = user
    session[:user]  = @current_user.id
    @current_user.poll(request.env['REMOTE_ADDR'])
  end
  
  def log_out!
    Merb.logger.info("trying to log out #{@current_user.login}")
    @current_user.poll(nil, true)
    session[:user] = nil
    @current_user = nil
  end
  
  def logged_in?
    @current_user != nil
  end
  
  def current_user
    @current_user
  end
  
  def access_denied
    redirect(url(:login), :message => { :error => 'Bitte einloggen oder einen neuen User anlegen (kostenlos, keine Daten notwendig!).' })
  end
  
  private
    def try_to_login
      Merb.logger.info("trying to login #{@current_user} <-- this should be nil btw")
      @current_user ||= (login_from_session || login_from_cookie)
      if @current_user
        Merb.logger.info("User #{@current_user.login} logged in!")
      else
        Merb.logger.info("User could not be logged in!")
      end
      @current_user
    end
  
    def login_from_session
      @current_user = User.get(session[:user]) if session[:user]
    end
  
    def login_from_cookie
      nil # since it's not implemented
    end
  
end
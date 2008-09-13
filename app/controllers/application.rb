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
    session[:user] = user.id
    @current_user = user
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
    # @current_user = User.get(:token => cookie[:token]) or something like that
    # session[:user] = @current_user.id needs to be set
    # @current_user # needs to be returned
    nil # since it's not implemented
  end
  
end
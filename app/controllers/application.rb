class Application < Merb::Controller
  
  before :login_required
  
  def login_required
    User.current.logged_in? || throw(:halt, :access_denied)
  end
  
  def logged_in?
    User.current.logged_in?
  end
  
  def access_denied
    redirect(url(:login), :message => { :error => 'Bitte einloggen oder einen neuen User anlegen (kostenlos, keine Daten notwendig!).' })
  end
  
end
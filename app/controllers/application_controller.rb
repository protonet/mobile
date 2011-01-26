# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  
  helper :all # include all helpers, all the time
  helper_method :logged_in?, :allow_signup?
  protect_from_forgery # See ActionController::RequestForgeryProtection for details
  # hack for reload problem in development
  before_filter :set_backend_for_development, :captive_check, :current_user, :set_current_user_for_authorization, :guest_login
  
  # Scrub sensitive parameters from your log
  filter_parameter_logging :password, :password_confirmation, :admin_password

  # devise migration
  def logged_in?
    user_signed_in?
  end
 
  private
  
  def guest_login
    @current_user = login_as_guest if current_user.nil?
  end

  def login_as_guest
    User.stranger(session[:session_id])
  end
  
  def set_backend_for_development
    System::Backend.backend_connection = BackendAdapters::DevelopmentMock.new unless System::Backend.backend_connection
  end
  
  def captive_check
    requested_uri = request.protocol + request.host_with_port + request.request_uri
    return true if System::Backend.requested_host_local?(request.host)
    # otherwise redirect to captive? and the url
    redirect_to "http://protonet/captive?req=" + URI.escape(requested_uri)
  end
  
  def only_registered
    if current_user.stranger?
      if System::Preferences.allow_dashboard_for_strangers == false
        flash[:error] = "Please authenticate :) !"
        return redirect_to("/login")
      else
        # check wether it is an allowed uri
        #  move to {:controller => '', :action => ''} scheme
        return redirect_to("/") unless [
          ["instruments", "index"],
          ["tweets", "create"],
          ["system/files", "index"],
          ["system/files", "create"],
          ["system/files", "show"]
        ].include?([params[:controller], params[:action]])
      end
    end
  end
  
  # There are multiple ways of handling authorization failures.  
  # One is to implement a permission denied method as shown below.  
  # If none is defined, either a simple string is displayed
  # to the user ("You are not allowed...", default) or the authorization
  # exception is raised.  TODO state configuration option
  def permission_denied
    respond_to do |format|
      flash[:error] = 'Sorry, you are not allowed to view the requested page.'
      format.html { redirect_to(:back) rescue redirect_to('/') }
      format.xml  { head :unauthorized }
      format.js   { head :unauthorized }
    end
  end
  
  # set_current_user sets the global current user for this request.  This
  # is used by model security that does not have access to the
  # controller#current_user method.  It is called as a before_filter.
  def set_current_user_for_authorization
    Authorization.current_user = current_user
  end
  
  def allow_signup?
    configatron.ldap.single_authentication != true && (
      System::Preferences.allow_registrations_for_strangers == true || 
      params[:invitation_token] && Invitation.unaccepted.find_by_token(params[:invitation_token]))
  end
  
end

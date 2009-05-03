# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  include AuthenticatedSystem
  
  helper :all # include all helpers, all the time
  protect_from_forgery # See ActionController::RequestForgeryProtection for details

  # Scrub sensitive parameters from your log
  # filter_parameter_logging :password
  
  helper_method :logged_out_user
  def logged_out_user(set_as_current=true)
    @logged_out_user ||= User.coward(session[:session_id])
    @current_user = @logged_out_user if set_as_current
    @logged_out_user
  end
  
end

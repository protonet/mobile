# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  include AuthenticatedSystem
  
  helper :all # include all helpers, all the time
  protect_from_forgery # See ActionController::RequestForgeryProtection for details
  # hack for reload problem in development
  before_filter :set_backend_for_development, :captive_check

  # Scrub sensitive parameters from your log
  filter_parameter_logging :password # TODO: confirmation field?
  
  private
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
  
end

# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  include AuthenticatedSystem
  
  helper :all # include all helpers, all the time
  protect_from_forgery # See ActionController::RequestForgeryProtection for details
  # hack for reload problem in development
  before_filter :set_backend_for_development

  # Scrub sensitive parameters from your log
  filter_parameter_logging :password # TODO: confirmation field?
  
  def current_user
    @current_user ||= User.stranger(session[:session_id])
  end
  
  private
  def set_backend_for_development
    System::Backend.backend_connection = BackendAdapters::DevelopmentMock.new unless System::Backend.backend_connection
  end
  
end

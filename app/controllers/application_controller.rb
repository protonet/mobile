class ApplicationController < ActionController::Base
  protect_from_forgery
  
  helper :all # include all helpers, all the time
  helper_method :logged_in?, :allow_signup?, :node_privacy_settings, :incoming_interface
  
  # hack for reload problem in development
  before_filter :set_backend_for_development, :captive_check, :current_user, :set_current_user_for_authorization, :guest_login

  # devise migration
  def logged_in?
    user_signed_in?
  end
 
  private
  
  def guest_login
    @current_user = login_as_guest if current_user.nil?
  end

  def login_as_guest
    session[:stranger_id] ||= ActiveSupport::SecureRandom.base64(20)
    User.stranger(session[:stranger_id])
  end
  
  def set_backend_for_development
    SystemBackend.backend_connection = BackendAdapters::DevelopmentMock.new unless SystemBackend.backend_connection
  end
  
  def captive_check
    return true
    requested_uri = request.protocol + request.host_with_port + request.fullpath
    return true if SystemBackend.requested_host_local?(request.host)
    # otherwise redirect to captive? and the url
    redirect_to "http://protonet/captive?req=" + URI.escape(requested_uri)
  end
  
  def only_registered
    if current_user.stranger?
      if node_privacy_settings["allow_dashboard_for_strangers"] != true
        flash[:error] = "Please authenticate :) !"
        return redirect_to(new_user_session_path)
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
      node_privacy_settings["allow_registrations_for_strangers"] == true || 
      params[:invitation_token] && Invitation.unaccepted.find_by_token(params[:invitation_token]))
  end
  
  def incoming_interface
    return "published_to_web" if request.env["HTTP_X_FORWARDED_FOR"]
    mapping = Rails.cache.fetch("system.interfaces", {:expires_in => 15.minutes}) do
      interface_mapping = {}
      SystemBackend.get_interfaces.each do |interface|
        network = (IP.new("#{interface.addresses("inet")}/16").network.to_s rescue nil)
        interface_mapping[network] = interface.name if network
      end
      interface_mapping 
    end
    interface = mapping[IP.new("#{request.remote_addr}/16").network.to_s] || "fallback"
    Rails.logger.info("request coming in on #{interface} with remote addr #{request.remote_addr}")
    interface
  end
  
  def node_privacy_settings
    @privacy_settings ||= Hash.new(false).merge(SystemPreferences.privacy[incoming_interface] || SystemPreferences.privacy["fallback"] || {})
  end
  
end
class ApplicationController < ActionController::Base
  protect_from_forgery
  
  helper :all # include all helpers, all the time
  helper_method :logged_in?, :allow_signup?, :node_privacy_settings, :incoming_interface, :address_for_current_interface
  
  # hack for reload problem in development
  before_filter :set_backend_for_development, :current_user, :set_current_user_for_authorization, :captive_check, :guest_login
  before_filter :detect_xhr_redirect
  
  after_filter :set_flash_message_to_header,    :if => Proc.new { |a| a.request.xhr? }
  after_filter :set_request_url_to_header,      :if => Proc.new { |a| a.request.xhr? }
  after_filter :compress,                       :if => Proc.new { |a| a.response.content_type == "application/json" }
  after_filter :set_controller_name_to_header,  :if => Proc.new { |a| a.request.xhr? }
  
  layout Proc.new { |a| return a.request.xhr? ? 'ajax' : 'application' }
  
  # devise migration
  def logged_in?
    user_signed_in?
  end

  def render_404
    if SystemPreferences.captive && !SystemBackend.requested_host_local?(request.host)
      render 'system/captive/browser_check', :status => 503, :layout => false
    else
      render :file => "#{Rails.root}/public/404.html", :status => 404, :layout => false
    end
  end
  
  private
  
  def compress
    if self.response.headers["Content-Transfer-Encoding"] != 'binary'
      begin
        ostream = StringIO.new
        gz = Zlib::GzipWriter.new(ostream)
        gz.write(self.response.body)
        self.response.body = ostream.string
        self.response.headers['Content-Encoding'] = 'gzip'
        self.response.headers['Expect'] = '100-continue'
      ensure
        gz.close
      end
    end
  end
  
  # https://bugzilla.mozilla.org/show_bug.cgi?id=553888
  # http://code.google.com/p/chromium/issues/detail?id=107159
  def redirect_to(options = {}, response_status = {})
    response_status[:status] ||= 303
    options.merge!('_xhr_redirect' => 1) if request.xhr?
    super(options, response_status)
  end
  
  def detect_xhr_redirect
    request.env['HTTP_X_REQUESTED_WITH'] = 'XMLHttpRequest' if request.url.include?('_xhr_redirect=1')
  end
  
  def set_controller_name_to_header
    response.headers['X-Controller-Name'] = controller_name
    response.headers['X-Action-Name']     = action_name
  end
  
  # needed for ajax requests
  def set_flash_message_to_header
    response.headers['X-Error-Message']   = flash[:error]   unless flash[:error].blank?
    response.headers['X-Notice-Message']  = flash[:notice]  unless flash[:notice].blank?
    response.headers['X-Sticky-Message']  = flash[:sticky]  unless flash[:sticky].blank?
    is_redirect = (301..303).include?(self.status)
    flash.discard unless is_redirect
    true
  end
  
  # needed because js can't figure out at which url an ajax request ended (redirects, ...) 
  def set_request_url_to_header
    response.headers['X-Url'] = request.url.sub(/_xhr_redirect=1&?/, '').sub(/\?$/, '')
  end
  
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
    unless params[:captive_redirect_url].blank?
      session[:captive_redirect_url] = params[:captive_redirect_url]
    end
    return true if SystemPreferences.captive != true
    return true if incoming_interface == "publish_to_web"
    return true if SystemBackend.requested_host_local?(request.host)
    mac_address = SystemBackend.get_mac_for_ip(request.remote_ip)

    # additional close connection on this one
    set_nocache_header
    response.headers['Connection'] = 'close'

    respond_to do |format|
      format.html {
        if SystemBackend.internet_access_granted?(mac_address)
          sleep 1
          return redirect_to(request.protocol + request.host_with_port + request.fullpath)
        else
          render 'system/captive/browser_check', :status => 503, :layout => false
        end
      }
      format.all {
        return head 503
      }
    end
  end  

  def only_registered
    if current_user.stranger?
      if node_privacy_settings["allow_dashboard_for_strangers"] != true
        return redirect_to(new_user_session_path)
      else
        # check wether it is an allowed uri
        #  move to {:controller => '', :action => ''} scheme
        return redirect_to("/") unless [
          ["instruments", "index"],
          ["meeps", "create"],
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
    SystemPreferences.remote_ldap_sign_on != true && (
      node_privacy_settings["allow_registrations_for_strangers"] == true || 
      params[:invitation_token] && Invitation.unaccepted.find_by_token(params[:invitation_token]))
  end
  
  def incoming_interface
    return "published_to_web" if request.env["HTTP_X_FORWARDED_FOR"]
    @incoming_interface ||= begin
      mapping = Rails.cache.fetch("system.interfaces", {:expires_in => 30.minutes}) do
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
  end
  
  def address_for_current_interface
    @ip_for_interface ||= begin
      mapping = Rails.cache.fetch("system.ips_for_interfaces", {:expires_in => 30.minutes}) do
        interface_ip_mapping = {}
        SystemBackend.get_interfaces.each do |interface|
          interface_ip_mapping[interface.name] = interface.addresses.find {|ip| ip if ip.ipv4?}.to_s
        end
        interface_ip_mapping
      end
      mapping[incoming_interface]
    end
  end
  
  def node_privacy_settings
    @privacy_settings ||= Hash.new(false).merge(SystemPreferences.privacy[incoming_interface] || SystemPreferences.privacy["fallback"] || {})
  end
  
  private
    def respond_to_preference_update(status=204)
      if request.xhr?
        head(status)
      else
        redirect_to :controller => '/preferences', :action => :show, :section => params[:section]
      end
    end

    def set_nocache_header
      response.headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate'
      response.headers['Pragma'] = 'no-cache'
      response.headers['Expires'] = 'Fri, 01 Jan 1990 00:00:00 GMT'
    end

end
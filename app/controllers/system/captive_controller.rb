module System
  class CaptiveController < ApplicationController

    before_filter :only_admin, :only => [:grant, :revoke, :whitelist_clients, :whitelist_sites]
  
    def index
      render :layout => 'logged_out'
    end

    def browser_check
      render :layout => false, :status => 503
    end
    
    def whitelist_clients
      new_whitelist = params[:whitelist].scan(/(..:..:..:..:..:..)/).flatten
      old_whitelist = SystemPreferences.captive_whitelist_clients
      (new_whitelist | old_whitelist).uniq.each do |mac_address|
        if new_whitelist.include?(mac_address)
          SystemBackend.grant_internet_access(mac_address, "n_a") unless old_whitelist.include?(mac_address)
        else
          SystemBackend.revoke_internet_access(mac_address)
        end
      end
      SystemPreferences.captive_whitelist_clients = new_whitelist
      flash[:notice] = "Your whitelist have been successfully saved"
      respond_to_preference_update
    end
    
    def whitelist_sites
      SystemPreferences.captive_whitelist_sites = params[:whitelist].scan(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/).flatten
      flash[:notice] = "Your whitelist have been successfully saved"
      respond_to_preference_update
    end
  
    def login
      if SystemPreferences.captive_redirect_only || current_user.stranger?
        return redirect_to(new_user_session_path)
      end
      mac_address = SystemBackend.get_mac_for_ip(request.remote_ip)
      if SystemBackend.internet_access_granted?(mac_address)
        return redirect_to_desired_url
      end
      if SystemPreferences.captive_authorization_url
        delimiter = SystemPreferences.captive_authorization_url.include?('?') ? "&" : "?"
        auth_url = "#{SystemPreferences.captive_authorization_url}#{delimiter}nickname=#{CGI.escape(current_user.login)}&email=#{CGI.escape(current_user.email)}&mac_address=#{CGI.escape(mac_address)}"
        response = Net::HTTP.get_response(URI.parse(auth_url))
        
        case response.code.to_i
        when 200
          SystemBackend.grant_internet_access(mac_address, (@current_user.try(:login) || "n_a"))
          sleep 6
          redirect_to_desired_url
        when 301..302
          redirect_to response.header['location']
        else
          flash[:error] = "Something went wrong please contact the support"
          redirect_to root_path
        end
      else
        SystemBackend.grant_internet_access(mac_address, (@current_user.try(:login) || "n_a"))
        sleep 6
        redirect_to_desired_url
      end
    end
    
    def self.matches?(url)
      false
    end

    private
    def redirect_to_desired_url
      redirect_to(session.delete(:captive_redirect_url) || "http://www.google.com")
    end
    
    def only_admin
      return true if current_user.admin?
      flash[:error] = "Not authorized, only admins are allowed to do this."
      head :unauthorized 
    end

  end
end
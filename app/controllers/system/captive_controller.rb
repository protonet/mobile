module System
  class CaptiveController < ApplicationController

    before_filter :only_admin, :only => [:grant, :revoke]
  
    def index
      flash[:sticky] = "please login or create an account to be able to use the internet!"
      render :layout => "registrations"
    end
    
    def store_redirect
      session[:captive_redirect_url] = params[:captive_redirect_url]
      head :ok
    end

    def whitelist
      new_whitelist = params[:whitelist].scan(/(..:..:..:..:..:..)/).flatten
      old_whitelist = SystemPreferences.whitelist
      (new_whitelist | old_whitelist).uniq.each do |mac_address|
        if new_whitelist.include?(mac_address)
          SystemBackend.grant_internet_access(mac_address, "n_a") unless old_whitelist.include?(mac_address)
        else
          SystemBackend.revoke_internet_access(mac_address)
        end
      end
      SystemPreferences[:whitelist] = new_whitelist
      flash[:notice] = "Your whitelist have been successfully saved"
      respond_to_preference_update
    end
  
    def login
      mac_address = SystemBackend.get_mac_for_ip(request.remote_ip)
      if SystemPreferences.captive_authorization_url
        delimiter = SystemPreferences.captive_authorization_url.include?('?') ? "&" : "?"
        auth_url = "#{SystemPreferences.captive_authorization_url}#{delimiter}nickname=#{CGI.escape(current_user.login)}&email=#{CGI.escape(current_user.email)}&mac_address=#{CGI.escape(mac_address)}"
        response = Net::HTTP.get_response(URI.parse(auth_url))
        
        case response.code.to_i
        when 200
          SystemBackend.grant_internet_access(mac_address, (@current_user.try(:login) || "n_a"))
          sleep 10
          redirect_to_desired_url
        when 301..302
          redirect_to response.header['location']
        else
          flash[:error] = "Something went wrong please contact the support"
          redirect_to root_path
        end
      else
        SystemBackend.grant_internet_access(mac_address, (@current_user.try(:login) || "n_a"))
        sleep 10
        redirect_to_desired_url
      end
    end
    
    def self.matches?(url)
      false
    end

    private
    def redirect_to_desired_url
      redirect_to(params[:captive_redirect_url] || session[:captive_redirect_url] || "http://www.google.com")
    end
    
    def only_admin
      return true if current_user.admin?
      flash[:error] = "Not authorized, only admins are allowed to do this."
      head :unauthorized 
    end

  end
end
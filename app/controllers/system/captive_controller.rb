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

    def grant
      response_code = if SystemBackend.grant_internet_access(params[:ip_address], "n_a")
        flash[:notice] = "You've granted internet access to \"#{params[:ip_address]}\"."
        204
      else
        flash[:error] = "Could not grant internet access to \"#{params[:ip_address]}\"."
        400
      end
      respond_to_preference_update
    end

    def revoke
      response_code = if SystemBackend.revoke_internet_access(params[:ip_address])
        flash[:notice] = "You've revoked internet access from \"#{params[:ip_address]}\"."
        204
      else
        flash[:error] = "Could not revoke internet access from \"#{params[:ip_address]}\"."
        400
      end
      respond_to_preference_update
    end
  
    def login
      if !SystemPreferences.captive_authorization_url.nil?
        auth_url = SystemPreferences.captive_authorization_url + "&nickname=#{CGI.escape(current_user.login)}&email=#{CGI.escape(current_user.email)}"
        if Net::HTTP.get_response(URI.parse(auth_url)).code == "200"
          SystemBackend.grant_internet_access(request.remote_ip, (@current_user.try(:login) || "n_a"))
          sleep 10
          if params[:captive_redirect_url]
            redirect_to params[:captive_redirect_url]
          else
            session[:captive_redirect_url] = nil
            redirect_to(session[:captive_redirect_url] || "http://www.google.de")
          end
        else
          flash[:error] = "Please contact the frontdesk / the administrator for internet access."
          redirect_to auth_url.gsub("check_in?token=CVFEZFZM6A7KaJ&", "?")
        end

      else

        SystemBackend.grant_internet_access(request.remote_ip, (@current_user.try(:login) || "n_a"))
        sleep 10
        if params[:captive_redirect_url]
          redirect_to params[:captive_redirect_url]
        else
          session[:captive_redirect_url] = nil
          redirect_to(session[:captive_redirect_url] || "http://www.google.de")
        end

      end
    end
    
    def self.matches?(url)
      false
    end

    private
    def only_admin
      return true if current_user.admin?
      flash[:error] = "Not authorized, only admins are allowed to do this."
      head :unauthorized 
    end

  end
end
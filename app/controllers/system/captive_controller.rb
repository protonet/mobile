module System
  class CaptiveController < ApplicationController
  
    def index
      flash[:sticky] = "please login or create an account to be able to use the internet!"
      render :layout => "registrations"
    end
  
    # this works fine, should/could be handled in rack, no idea though
    def catchall
      render :file => "#{Rails.root}/public/404.html", :status => 404
    end
    
    def store_redirect
      session[:captive_redirect_url] = params[:captive_redirect_url]
      head :ok
    end
  
    def login
      SystemBackend.grant_internet_access(request.remote_ip, @current_user.try(:login))
      sleep 3
      
      if params[:captive_redirect_url]
        redirect_to params[:captive_redirect_url]
      else
        session[:captive_redirect_url] = nil
        redirect_to session[:captive_redirect_url]
      end
      
    end
    
    def self.matches?(url)
      false
    end

  end
end
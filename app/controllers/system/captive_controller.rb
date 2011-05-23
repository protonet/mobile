module System
  class CaptiveController < ApplicationController
  
    def index
      flash[:sticky] = "you've now got access to the internet!"
      render :layout => "registrations"
    end
  
    # this works fine, but nicer would be to solve this in rack. So not Rails handles 404
    def catchall
      render :file => "#{Rails.root}/public/404.html", :status => 404
    end
  
    def login
      SystemBackend.grant_internet_access(request.remote_ip)
      sleep 3
      
      if params[:req]
        redirect_to params[:req]
      else
        redirect_to request.referer
      end
      
    end
    
    def self.matches?(url)
      false
    end

  end
end
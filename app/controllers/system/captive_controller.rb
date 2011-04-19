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
      local_filename = 'tmp/captive_users'
      doc = request.remote_ip + "\t" + SystemBackend.get_mac_for_ip(request.remote_ip) + "\t"  + Time.now().strftime("%d.%m.%y") + "\n"
    
      File.open(local_filename, 'a') {|f| f.write(doc) }
    
      SystemBackend.grant_internet_access(request.remote_ip)
      sleep 3
      redirect_to params[:req]
    end
    
    def self.matches?(url)
      false
    end

  end
end
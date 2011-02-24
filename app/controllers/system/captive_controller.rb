class System::CaptiveController < ApplicationController
  
  def index
  end
  
  # this works fine, but nicer would be to solve this in rack. So not Rails handles 404
  def catchall
    render :file => "#{RAILS_ROOT}/public/404.html", :status => 404
  end
  
  def login
    local_filename = 'tmp/captive_users'
    doc = request.remote_ip + "\t" + System::Backend.get_mac_for_ip(request.remote_ip) + "\t"  + Time.now().strftime("%d.%m.%y") + "\n"
    
    File.open(local_filename, 'a') {|f| f.write(doc) }
    
    System::Backend.grant_internet_access(request.remote_ip)
    sleep 3
    redirect_to params[:req]
  end

end

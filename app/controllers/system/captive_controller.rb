class System::CaptiveController < ApplicationController
  def index
    
  end
  
  def login
    local_filename = 'tmp/captive_users'
    doc = request.remote_ip + "\t" + System::Backend.get_mac_for_ip(request.remote_ip) + "\t"  + Time.now().strftime("%d.%m.%y") + "\n"
    
    File.open(local_filename, 'w') {|f| f.write(doc) }
    
    System::Backend.grant_internet_access(request.remote_ip)
    redirect_to params[:req]
  end

end

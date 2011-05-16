class SystemVpn
  
  class << self
    def register_with_monit
      
    end
    
    def registered_with_monit?
      
    end
    
    def start
      return unless Rails.env == 'production'
      # SystemBackend.monit_start(:)
      `/usr/bin/sudo /home/protonet/dashboard/current/script/init/vpn start #{SystemPreferences.vpn[:identifier]} #{SystemPreferences.vpn[:password]}`
    end
  
    def stop
      return unless Rails.env == 'production'
      `/usr/bin/sudo /home/protonet/dashboard/current/script/init/vpn stop`
    end
  
    def status
      return 'off' unless Rails.env == 'production'
      system("/usr/bin/sudo /home/protonet/dashboard/current/script/init/vpn status") ? 'on' : 'off'
    end
  end

end
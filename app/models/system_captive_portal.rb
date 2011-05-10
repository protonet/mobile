class SystemCaptivePortal
  
  class << self
    
    def activate
      `#{service_command} start`
    end
    
    def deactivate
      `#{service_command} flush`
    end
    
    def captive_status
      false
    end
    
    private
    def service_command
      public_interface = "foo"
      external_interface = "bar"
      "/usr/bin/sudo #{configatron.current_file_path}/script/init/captive_portal #{configatron.current_file_path} #{public_interface} #{external_interface}"
    end
    
  end

end
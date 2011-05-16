class SystemCaptivePortal
  
  class << self
    
    def start(external_interface, internal_interface)
      `#{service_command} start`
    end
    
    def stop(external_interface, internal_interface)
      `#{service_command} stop`
    end
    
    def captive_status
      # `#{service_command} check`
      true
    end
    
    private
    def service_command(external_interface, internal_interface)
      public_interface = "foo"
      external_interface = "bar"
      "/usr/bin/sudo #{configatron.current_file_path}/script/init/captive_portal #{public_interface} #{external_interface}"
    end
    
  end

end
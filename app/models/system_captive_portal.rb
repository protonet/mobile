class SystemCaptivePortal
  
  class << self
    
    def start
      `#{service_command("start")}`
    end
    
    def stop
      `#{service_command("stop")}`
    end
    
    def captive_status
      `#{service_command("status")}`
    end
    
    private
    def service_command(argument)
      "/usr/bin/sudo #{configatron.current_file_path}/script/init/captive_portal #{SystemPreferences.captive_external_interface} #{SystemPreferences.captive_internal_interface} #{SystemPreferences.captive_redirection_target} #{argument}"
    end
    
  end

end
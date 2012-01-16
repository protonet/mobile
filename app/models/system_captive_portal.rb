class SystemCaptivePortal
  
  class << self
    
    def start
      (`#{service_command("start")}` && SystemPreferences.captive = true) if config_check
    end
    
    def stop
      (`#{service_command("stop")}` && SystemPreferences.captive = false) if config_check
    end
    
    def status
      `#{service_command("status")}` if config_check
    end

    def list
      `#{service_command("list")}` if config_check
    end
    
    private
    def service_command(argument)
      "/usr/bin/sudo #{configatron.current_file_path}/script/init/captive_portal #{SystemPreferences.captive_external_interface} #{SystemPreferences.captive_internal_interface} #{SystemPreferences.captive_redirection_target} #{argument}"
    end

    def config_check
      return false if Rails.env.development?
      return false if [SystemPreferences.captive_external_interface, SystemPreferences.captive_internal_interface, SystemPreferences.captive_redirection_target].any? {|setting| setting.nil?}
    end
    
  end

end
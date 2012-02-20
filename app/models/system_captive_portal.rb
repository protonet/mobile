class SystemCaptivePortal
  
  class << self
    
    def start
      `#{service_command("start")}` if config_check
      SystemPreferences.whitelist.each do |mac|
        SystemBackend.grant_internet_access(mac, "n_a")
      end
    end
    
    def stop
      `#{service_command("stop")}` if config_check
    end
    
    def status
      system(service_command("status")) if config_check
    end

    def list
      if config_check
        client_list = (`/usr/bin/sudo #{configatron.current_file_path}/script/init/client_internet_access list` || "").strip
        client_list.split("\n")
      else
        []
      end
    end
    
    private
    def service_command(argument)
      "/usr/bin/sudo #{configatron.current_file_path}/script/init/captive_portal #{SystemPreferences.captive_external_interface} #{SystemPreferences.captive_internal_interface} #{SystemPreferences.captive_redirection_target} #{argument}"
    end

    def config_check
      return false if Rails.env.development?
      return false if [SystemPreferences.captive_external_interface, SystemPreferences.captive_internal_interface, SystemPreferences.captive_redirection_target].any? {|setting| setting.nil?}
      true
    end
    
  end

end
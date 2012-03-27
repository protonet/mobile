class SystemCaptivePortal
  
  class << self
    
    def start
      return false unless config_check
      SystemBackend.update_whitelist_sites(SystemPreferences.captive_whitelist_sites)
      `#{service_command("start")}`
      SystemPreferences.captive_whitelist_clients.each do |mac|
        SystemBackend.grant_internet_access(mac, "n_a")
      end
      SystemNetworking.setup_interface_script("captive_portal", SystemPreferences.captive_internal_interface, service_arguments("start"), service_arguments("stop"))
    end
    
    def stop
      return false unless config_check
      `#{service_command("stop")}`
      #  remove all captive portal instances
      SystemBackend.get_interfaces.collect do |interface|
        SystemNetworking.remove_interface_script("captive_portal", interface.name)
      end
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
      "/usr/bin/sudo #{configatron.current_file_path}/script/init/captive_portal #{service_arguments(argument)} 2>&1 >> #{configatron.current_file_path}/log/captive_portal.log"
    end

    def service_arguments(argument)
      "#{SystemPreferences.captive_external_interface} #{SystemPreferences.captive_internal_interface} #{SystemPreferences.captive_redirection_target} #{argument}"
    end

    def config_check
      return false if Rails.env.development?
      return false if [SystemPreferences.captive_external_interface, SystemPreferences.captive_internal_interface, SystemPreferences.captive_redirection_target].any? {|setting| setting.nil?}
      true
    end
    
  end

end
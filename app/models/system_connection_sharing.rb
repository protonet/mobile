class SystemConnectionSharing
  class << self
    def start(intif)
      extif = SystemBackend.current_internet_interface
      service_command("start", extif, intif)
      SystemNetworking.setup_interface_script("connection_sharing", intif, "start #{extif} #{intif}", "stop #{extif} #{intif}")
    end
    
    def stop(intif)
      extif = SystemBackend.current_internet_interface
      service_command("remove", extif, intif)
      SystemNetworking.remove_interface_script("connection_sharing", intif)
    end
    
    def status(intif)
      extif = SystemBackend.current_internet_interface
      service_command("status", extif, intif).gsub(/\W/, "") == "Active"
    end
    
    private
    def service_command(command, extif, intif)
      `/usr/bin/sudo #{configatron.current_file_path}/script/init/connection_sharing #{command} #{extif} #{intif}`
    end
  end
end
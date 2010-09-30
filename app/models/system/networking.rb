module System
  class Networking
    
    class << self
      
      def load_iptable_rules
        
      end
      
      def config_wifi_interface(interface, ip)
        config_file = "#{configatron.shared_file_path}/config/ifconfig.d/#{interface}"
        return if File.exists?(config_file) # yeah doesn't handle ip changes
        File.open(config_file, 'w') {|f| f.write("#!/bin/bash\nifconfig #{interface} #{ip} netmask 255.255.255.0") }
        `/bin/chmod +x #{config_file}`
        restart_interface(interface)
      end
      
      def restart_interface(interface)
        `/sbin/ifconfig #{interface} down`
        `/sbin/ifconfig #{interface} up`
      end
      
    end

  end
end
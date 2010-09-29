module System
  class Networking
    
    class << self
      
      def load_iptable_rules
        
      end
      
      def config_wifi_interface(interface, ip)
        config_file = "#{configatron.shared_file_path}/config/ifconfig.d/#{interface}"
        return if File.exists?(config_file) # yeah doesn't handle ip changes
        File.open(config_file, 'w') {|f| f.write("address #{ip}\nnetmask 255.255.255.0") }
      end
      
    end

  end
end
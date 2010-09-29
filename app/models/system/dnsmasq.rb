module System
  class Dnsmasq
    
    class << self
            
      def add_interface(interface)
        # address=/protonet/10.42.2.1
        # interface=wlan0
        # dhcp-range=wlan0,192.168.100.100,192.168.100.199,4h
      end
      
      def restart_dnsmasq
        `sudo /etc/init.d/dnsmasq restart`
      end
      
    end

  end
end
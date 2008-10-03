module BackendAdapters
  class Ubuntu
    
    DEFAULT_WLAN_INTERFACES = [:private_interface, :public_interface]
    
    DEFAULT_UBUNTU_CONFIG = {
      :private_interface => 'ath0',
      :public_interface => 'ath1',
      :base_connection => 'eth0'
    }
    
    # maybe move it up a bit
    REGS = {
      :mac => /..:..:..:..:..:../
    }
    
    
    def initialize(config={})
      @config = config.merge(DEFAULT_UBUNTU_CONFIG)
    end
    
    def info
      "ubuntu backend"
    end
    
    def get_ips_of_currently_connected_clients
    
    end

    def give_internet_rights_to_client(ip)
    
    end
  
    def revoke_internet_rights_from_client(ip)

    end
    
#    private
      def get_connected_macs_to_wlan(iface)
        raise ArgumentError, iface unless DEFAULT_WLAN_INTERFACES.include?(iface)
        `wlanconfig #{@config[iface]} list sta`.scan(REGS[:mac]).map {|m| m.upcase!}
      end
      
      def get_ip_for_mac(mac, ifaces = DEFAULT_WLAN_INTERFACES, refresh = false)
        raise ArgumentError, mac unless mac.match(REGS[:mac]) or (ifaces - DEFAULT_WLAN_INTERFACES).empty?
        # this is a little hackish, will be changed though
        ip_array = ifaces.collect do |iface|
          match = `arp -a -i #{@config[iface]}`.match(/\((.*)\).*#{mac}/)
          match && match[1]
        end
        raise RuntimeError, ip_array if ip_array.size != 1
        ip_array.first
      end      
      

  end
end

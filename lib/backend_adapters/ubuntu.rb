module BackendAdapters
  class Ubuntu
    
    DEFAULT_WLAN_INTERFACES = [:private_interface, :public_interface]
    
    DEFAULT_UBUNTU_CONFIG = {
      :private_interface => 'ath0',
      :public_interface => 'ath1',
      :base_connection => 'eth0'
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
    
    private
      def get_connected_macs_to_wlan(iface)
        raise "InterfaceNotAllowed", iface unless DEFAULT_WLAN_INTERFACES.include?(iface)
        return `wlanconfig #{@config[iface]} list sta`
      end  

  end
end

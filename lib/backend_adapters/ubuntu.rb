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
      DEFAULT_WLAN_INTERFACES.collect do |iface|
        get_connected_macs_to_wlan(iface).collect do |mac|
          get_ip_for_mac(mac, iface)
        end
      end.flatten
    end

    def give_internet_rights_to_client(ip)
    
    end
  
    def revoke_internet_rights_from_client(ip)

    end
    
   private
      def get_connected_macs_to_wlan(iface)
        raise ArgumentError, iface unless DEFAULT_WLAN_INTERFACES.include?(iface)
        `wlanconfig #{@config[iface]} list sta`.scan(REGS[:mac]).map {|m| m.upcase!}
      end
      
      def get_ip_for_mac(mac, ifaces = DEFAULT_WLAN_INTERFACES, refresh = false)
        # todo: I'm not sure if this is beautiful enough, might need to some refactoring
        # maybe make it two methods (on from one interface and one from several interfaces,
        # or maybe even just all interfaces, let's see how this goes)...
        ifaces = Array(ifaces)
        raise ArgumentError, mac unless mac.match(REGS[:mac]) or (ifaces - DEFAULT_WLAN_INTERFACES).empty?
        # this is a little hackish, will be changed though
        # I do this loop since the mac your searching for might be connected to any given iface
        # the runtime error is raised since, it is possible that your mac address still is in the arp cache
        # for iface 1 even though you are already connected to iface 2 this an update needs to be done at that point
        # (that's what that refresh parameter is for)
        # to_a makes sure it's an array
        ip_array = ifaces.collect do |iface|
          match = `arp -a -i #{@config[iface]}`.match(/\((.*)\).*#{mac}/)
          match && match[1]
        end
        ip_array.compact!
        raise RuntimeError, ip_array if ip_array.size != 1 # not implemented yet
        ip_array.first
      end
      
  end
end

module BackendAdapters
  class DevelopmentMock
    
    def info
      "development mock"
    end
    
    def server_ips
      @server_ips ||= `ifconfig`.scan(/.*inet (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/).collect {|ip| ip[0]}
    end
    
    def get_ips_of_currently_connected_clients
      # I'm just mocking some return IP functionality
      ["10.25.1.2", "10.25.1.3", "10.25.1.4"]
    end
  
    def grant_internet_access(ip, username)
    
    end
  
    def revoke_internet_access(ip)

    end
    
    def get_hostname_for_ip(ip)
      match = `nslookup #{ip}`.split("\t").last.match(/name = (.*)\./) && match[1]
    end
    
    # the following method currently on osx, and probably not an all systems
    def ssid_of_base_station
      `/System/Library/PrivateFrameworks/Apple80211.framework/Versions/A/Resources/airport -I`.match(/BSSID: (.*)/)[1].gsub(/0{1}:?/, '00').delete(':')
    end
    
    def get_interfaces
      ::IfconfigWrapper.new.parse
    end
    
    def get_active_interfaces
      ::IfconfigWrapper.new.parse
    end

    def get_interface_information(iface) # TODO: take 'information' off the name
      get_interfaces[iface]
    end
    
    def hostname
      'localhost'
    end
    
    def requested_host_local?(host)
      true
    end
    
    
    def get_mac_for_ip(ip)
      '7c:c5:37:45:7f:85'
    end
    
    def current_internet_interface
      'dev0'
    end
    
    def license_key
      "development"
    end
    
    def wpa_passphrase(ssid_name, password)
      "foobarius"
    end
  end
end

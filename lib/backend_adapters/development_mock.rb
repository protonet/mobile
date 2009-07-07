module BackendAdapters
  class DevelopmentMock
    
    def info
      "development mock"
    end
    
    def server_ips
      @server_ips ||= `ifconfig`.scan(/en[0-9].*\n.*inet (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/).collect {|ip| ip[0]}
    end
    
    def get_ips_of_currently_connected_clients
      # I'm just mocking some return IP functionality
      ["10.25.1.2", "10.25.1.3", "10.25.1.4"]
    end
  
    def give_internet_rights_to_client(ip)
    
    end
  
    def revoke_internet_rights_from_client(ip)

    end
    
    # the following method currently on osx, and probably not an all systems
    def ssid_of_base_station
      `/System/Library/PrivateFrameworks/Apple80211.framework/Versions/A/Resources/airport -I`.match(/BSSID: (.*)/)[1].gsub(/0{1}:?/, '00').delete(':')
    end
    
  end
end

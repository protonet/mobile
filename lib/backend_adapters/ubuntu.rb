module BackendAdapters
  class Ubuntu
    
    def self.info
      "ubuntu backend"
    end
    
    class << self

      def get_ips_of_currently_connected_clients
      
      end
  
      def give_internet_rights_to_client(ip)
      
      end
    
      def revoke_internet_rights_from_client(ip)
  
      end
    
    end
    
    private
      def get_connected_macs_to_wlan
        `wlanconfig ath0 list sta` 
      end 
  end
end

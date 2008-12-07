module BackendAdapters
  class DevelopmentMock
    
    def info
      "development mock"
    end
    
    def get_ips_of_currently_connected_clients
      # I'm just mocking some return IP functionality
      ["10.25.1.2", "10.25.1.3", "10.25.1.4"]
    end
  
    def give_internet_rights_to_client(ip)
    
    end
  
    def revoke_internet_rights_from_client(ip)

    end
    
  end
end

require 'net/https'
class Location

  class << self
    
    #todo refactor this, this is just a test
    def retreive_location_by_current_basestation
      retreive_location_by_mac(Backend.ssid_of_base_station)
    end
    
    def retreive_location_by_mac(mac)
      # mac.delete!(':').upcase
      req_body = %{  
      <?xml version='1.0'?>  
      <LocationRQ xmlns='http://skyhookwireless.com/wps/2005' version='2.6' street-address-lookup='full'>  
        <authentication version='2.0'>  
          <simple>  
            <username>beta</username>  
            <realm>js.loki.com</realm>  
          </simple>  
        </authentication>  
        <access-point>  
          <mac>#{mac}</mac>  
          <signal-strength>-50</signal-strength>  
        </access-point>  
      </LocationRQ>  
      }.gsub(/^\s+|[\r\n]/, '')  
      
      http = Net::HTTP.new('api.skyhookwireless.com', 443)  
      http.use_ssl = true

      http.start do |h|  
        resp = h.post '/wps2/location', req_body, 'Content-Type' => 'text/xml'
        if resp.body =~ /<latitude>([^<]+).+<longitude>([^<]+)/
          result =  [$1, $2]
        else
          result =  nil
        end
      end
    end
    
  end

end

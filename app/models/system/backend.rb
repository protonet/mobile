module System
  class Backend
  
    cattr_accessor :backend_connection
  
    # this basically defines the backend api interface (of course without signatures...)
    @@backend_api_methods = [
      :info,
      :get_ips_of_currently_connected_clients,
      :give_internet_rights_to_client,
      :rewoke_internet_rights_from_client,
      :ssid_of_base_station,
      :server_ips
      ].freeze
  
    class << self

      def method_missing(method, *args, &block)
        super unless @@backend_api_methods.include?(method)
        backend_connection.send(method, *args, &block)
      end

    end
  
  end
end
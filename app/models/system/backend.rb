module System
  class Backend
  
    cattr_accessor :backend_connection
  
    # this basically defines the backend api interface (of course without signatures...)
    @@backend_api_methods = [
      :info,
      :get_ips_of_currently_connected_clients,
      :grant_internet_access,
      :revoke_internet_access,
      :ssid_of_base_station,
      :server_ips,
      :get_interfaces,
      :get_interface_information,
      :get_hostname_for_ip,
      :get_mac_for_ip,
      :hostname,
      :requested_host_local?
      ].freeze
  
    class << self

      def method_missing(method, *args, &block)
        super unless @@backend_api_methods.include?(method)
        backend_connection.send(method, *args, &block)
      end

    end
  
  end
end
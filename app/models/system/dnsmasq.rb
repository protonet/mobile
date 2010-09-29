module System
  class Dnsmasq
    
    class << self
            
      def add_interface(interface, ip)
        config_file = "#{configatron.shared_file_path}/config/dnsmasq.d/#{interface}"
        return if File.exists?(config_file)
        ip = IP.new(ip)
        File.open(config_file, 'w') {|f| f.write("address=/protonet/#{ip}\ninterface=#{interface}\ndhcp-range=#{interface},#{ip.network(1)},#{ip.network(200)},4h") }
        restart
      end
      
      def restart
        `sudo /etc/init.d/dnsmasq restart`
      end
      
    end

  end
end
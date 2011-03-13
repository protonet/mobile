class SystemDnsmasq
  
  class << self
          
    def add_interface(interface, ip)
      return if File.exists?(config_file(interface))
      ip = IP.new(ip)
      File.open(config_file(interface), 'w') {|f| f.write("interface=#{interface}\naddress=/protonet/#{ip}\ndhcp-range=#{interface},#{ip.network(1)},#{ip.network(200)},4h") }
      restart(interface)
    end
    
    def restart(interface)
      `sudo /home/protonet/dashboard/current/script/init/dnsmasq /home/protonet/dashboard/current restart #{interface}`
    end
    
    def config_file(interface)
      "#{configatron.shared_file_path}/config/dnsmasq.d/#{interface}"
    end
    
    
  end

end
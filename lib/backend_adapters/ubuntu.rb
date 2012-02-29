module BackendAdapters
  class Ubuntu
    
    DEFAULT_WLAN_INTERFACES = [:private_interface, :public_interface]
    
    DEFAULT_UBUNTU_CONFIG = {
      :private_interface => 'wlan0',
      # :public_interface => 'ath1',
      :base_connection => 'eth0',
      :arp_command => ''
    }
    
    # maybe move it up a bit
    REGEXPS = {
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
    
    def get_interfaces
      ::IfconfigWrapper.new(nil, IO.popen("/sbin/ifconfig -a"){ |f| f.readlines.join }).parse
    end
    
    def get_active_interfaces
      ::IfconfigWrapper.new(nil, IO.popen("/sbin/ifconfig"){ |f| f.readlines.join }).parse
    end
    
    def get_interface_information(iface)
      get_interfaces[iface]
    end
    
    def get_hostname_for_ip(ip)
      (match = `nslookup #{ip}`.split("\t").last.match(/name = (.*)\./)) && match[1]
    end
    
    def get_ip_for_hostname(hostname)
      (match = `nslookup #{hostname}`.split("\t").last.match(/Address: (.*)\n\n/m)) && match[1]
    end
    
    def hostname
      @hostname ||= `hostname`.strip!
    end
    
    def local_hosts
      @local_hosts ||= ([
        SystemPreferences.public_host.gsub(/\:[0-9]*/, ''),
        hostname,
        "local.protonet.info",
        "#{hostname}.local",
        "localhost",
        "127.0.0.1",
        "10.42.0.1",
        "10.43.0.1",
        "protonet"
      ] | SystemBackend.get_active_interfaces.map {|i| i.addresses.first.to_s})
    end
    
    def check_locality(host)
      if local_hosts.include?(get_ip_for_hostname(host))
        @local_hosts << host
      end
    end
    
    def requested_host_local?(host)
      local_hosts.include?(host) || check_locality(host)
    end
    
    def wpa_passphrase(ssid, passphrase)
      `/usr/bin/wpa_passphrase '#{ssid}' '#{passphrase}'`.match(/\tpsk=(.*)$/)[1].strip
    end
    
    # private
    def parse_raw_ifconfig raw, keys=nil
      data = {}
      
      # The first line is a little strange because the interface name
      # can contain spaces and HWaddr doesn't have a colon.
      # TODO: Use some OOP stuff instead of =~ and $~
      raw =~ /^Link encap:(.+?)  (?:HWaddr ([0-9a-fA-F:]+))?/
      data['type'], data['MAC'] = $~.captures
      
      keys ||= ['inet addr', 'inet6 addr', 'RX packets', 'TX packets', 'RX bytes', 'TX bytes']
      keys.each do |key|
        next unless raw.include? key
        
        start = raw.index(key) + key.size + 1 # account for the colon
        space = raw.index(' ', start + 1) - 1 # trim space
        data[key] = raw[start..space].strip
      end
      
      data
    end
    
    def internet_access_grants_file
      "#{configatron.shared_file_path}/config/ifconfig.d/allowed_clients"
    end
    
    def iptables_command
      "/usr/bin/sudo /sbin/iptables"
    end
    
    def grant_internet_access(mac, username = nil)
      # Add computer addresses to file
      grants_entry = "#{mac}\t#{Time.now().strftime("%d.%m.%y")}\t#{username}\n"
      File.open(internet_access_grants_file, 'a') {|f| f.write(grants_entry) }
    
      # Add mac to granted clients
      `/usr/bin/sudo #{configatron.current_file_path}/script/init/client_internet_access grant #{mac} #{username}`
    end

    def internet_access_granted?(mac)
      `/usr/bin/sudo #{configatron.current_file_path}/script/init/client_internet_access status #{mac}`
    end
    
    def in_grants_file?(mac)
      open(internet_access_grants_file).grep(/#{mac}/).size > 0
    end
    
    def revoke_internet_access(mac)
      `/usr/bin/sudo #{configatron.current_file_path}/script/init/client_internet_access revoke #{mac}`
      lines = File.readlines(internet_access_grants_file)
      File.open(internet_access_grants_file, 'w') do |f|
        lines.each do |line|
          f.write(line) unless line.match(mac)
        end
      end
    end
    
    def current_internet_interface
      `/sbin/route -n`.match(/.*UG.*/).to_s.split(" ").last rescue nil
    end
    
    def license_key
      File.read("#{configatron.deploy_config_file_path}").match(":key,.*\"(.*)\"")[1] rescue nil
    end
    
   # private
      def get_connected_macs_to_wlan(iface)
        raise ArgumentError, iface unless DEFAULT_WLAN_INTERFACES.include?(iface)
        foo = `wlanconfig #{@config[iface]} list sta`
        # Merb.logger.error('whoami: ' + `which arp`)
        # Merb.logger.error('macs:' + foo)
        foo.scan(REGEXPS[:mac]).map {|m| m.upcase!}
      end
      
      def get_ip_for_mac(mac, ifaces = DEFAULT_WLAN_INTERFACES, refresh = false)
        # todo: I'm not sure if this is beautiful enough, might need to some refactoring
        # maybe make it two methods (on from one interface and one from several interfaces,
        # or maybe even just all interfaces, let's see how this goes)...
        ifaces = Array(ifaces)
        raise ArgumentError, mac unless mac.match(REGEXPS[:mac]) or (ifaces - DEFAULT_WLAN_INTERFACES).empty?
        # this is a little hackish, will be changed though
        # I do this loop since the mac your searching for might be connected to any given iface
        # the runtime error is raised since, it is possible that your mac address still is in the arp cache
        # for iface 1 even though you are already connected to iface 2 this an update needs to be done at that point
        # (that's what that refresh parameter is for)
        # to_a makes sure it's an array
        ip_array = ifaces.collect do |iface|
          match = `/usr/sbin/arp -a -n -i #{@config[iface]}`
          # Merb.logger.error('arp:' + match)
          match = match.match(/\((.*)\).*#{mac}/)
          match && match[1]
        end
        ip_array.compact!
        # raise RuntimeError, ip_array if ip_array.size != 1 # not implemented yet
        ip_array.first
      end

      def get_mac_for_ip(ip)
        match = `/usr/sbin/arp -n -a #{ip}`
        match = match.match(REGEXPS[:mac])
        match && match[0].upcase
      end
  end
end

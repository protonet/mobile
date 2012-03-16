class SystemDnsmasq
  
  class << self
    
    def start(interface)
      configure(interface)
      if SystemMonit.exists?(service_name(interface))
        SystemMonit.restart(service_name(interface))
      else
        monitor_service(interface)
        SystemNetworking.setup_interface_script("dnsmasq", interface, "start #{interface}", "stop #{interface}")
      end
    end
    
    def stop(interface, do_reload = true)
      if SystemMonit.exists?(service_name(interface))
        SystemMonit.remove(service_name(interface), do_reload)
        SystemNetworking.remove_interface_script("dnsmasq", interface)
      end
    end

    def status(interface)
      return false unless Rails.env == 'production'
      system(service_command("status", interface))
    end

    def restart_active
      interfaces = SystemBackend.get_interfaces.collect {|interface| interface.name if status(interface.name)}.compact
      interfaces.each do |interface|
        start(interface)
        sleep 1
      end
    end
    
    private
    def service_name(interface)
      "dnsmasq_#{interface}".to_sym
    end
    
    def monitor_service(interface)
      return if SystemMonit.exists?(service_name(interface)) && SystemMonit.start(service_name(interface))
      start = service_command("start", interface)
      stop  = service_command("stop", interface)
      pid_file = "#{configatron.current_file_path}/tmp/pids/dnsmasq_#{interface}.pid"
      SystemMonit.add(service_name(interface), start, stop, pid_file)
    end
    
    def service_command(command, interface)
      "/usr/bin/sudo #{configatron.current_file_path}/script/init/dnsmasq #{command} #{interface}"
    end

    def configure(interface)
      ip = IP.new(SystemPreferences.wifi[interface]["ip"])
      setting = <<-EOS
interface=#{interface}
address=/protonet/#{ip}
address=/#{SystemBackend.hostname}/#{ip}
address=/#{SystemPreferences.public_host}/#{ip}
dhcp-range=#{interface},#{ip.network(1)},#{ip.network(32000)},4h
dhcp-option=6,#{ip}
bind-interfaces
except-interface=lo
EOS
      File.open(config_file(interface), 'w') {|f| f.write(setting) }
    end
    
    def config_file(interface)
      "#{configatron.shared_file_path}/config/dnsmasq.d/#{interface}"
    end
    
  end

end
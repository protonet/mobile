class SystemNetworking
  
  class << self
    
    def iptables_rules_ready?
      return false unless Rails.env == 'production'
      return true if File.exists?("#{configatron.shared_file_path}/config/ifconfig.d/iptables")
      !!FileUtils.cp("#{Rails.root}/lib/backend_adapters/ubuntu/iptables/protonet", "#{configatron.shared_file_path}/config/ifconfig.d/iptables")
    end
    
    def config_wifi_interface(interface, ip)
      #doesn't work
    end

    def restart_interface(interface)
      `/sbin/ifconfig #{interface} down`
      `/sbin/ifconfig #{interface} up`
    end

  end

end
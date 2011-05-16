class SystemNetworking
  
  class << self
    
    def iptables_rules_ready?
      return false unless Rails.env == 'production'
      return true if File.exists?("#{configatron.shared_file_path}/config/ifconfig.d/iptables")
      !!FileUtils.cp("#{Rails.root}/lib/backend_adapters/ubuntu/iptables/protonet", "#{configatron.shared_file_path}/config/ifconfig.d/iptables")
    end
    
    def setup_interface_script(script_name, interface, start_command, stop_command)
      raise RuntimeError unless ["check_ip_settings", "dnsmasq", "captive_portal", "connection_sharing"].include?(script_name)
      config = <<-EOS
#!/bin/bash
case $1 in
   start)
      #{configatron.current_file_path}/script/init/#{script_name} #{start_command}
      ;;
    stop)
      #{configatron.current_file_path}/script/init/#{script_name} #{stop_command}
      ;;
esac
exit 0
EOS
      file_path = "#{configatron.shared_file_path}/ifconfig.d/#{script_name}_#{interface}"
      File.open(file_path, 'w') {|f| f.write(config) }
    end
    
    def remove_interface_script(script_name, interface)
      raise RuntimeError unless ["check_ip_settings", "dnsmasq", "captive_portal", "connection_sharing"].include?(script_name)
      file_path = "#{configatron.shared_file_path}/ifconfig.d/#{script_name}_#{interface}"
      FileUtils.rm_rf(file_path)
    end

    def restart_interface(interface)
      `/sbin/ifconfig #{interface} down`
      `/sbin/ifconfig #{interface} up`
    end

  end

end
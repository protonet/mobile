class SystemCaptivePortal
  
  class << self
    
    def activate
      `#{service_command} start`
    end
    
    def deactivate
      `#{service_command} flush`
    end
    
    def iptables_rules_ready?
      return false unless Rails.env == 'production'
      return true if File.exists?("#{configatron.shared_file_path}/config/ifconfig.d/iptables")
      !!FileUtils.cp("#{Rails.root}/lib/backend_adapters/ubuntu/iptables/protonet", "#{configatron.shared_file_path}/config/ifconfig.d/iptables")
    end
    
    def captive_status
      false
    end
    
    private
    def monitor_service
      return if SystemMonit.exists?(:captive_portal) && SystemMonit.start(:captive_portal)
      iptables_rules_ready?
      start = "#{service_command} start"
      stop  = "#{service_command} stop"
      pid_file = "#{configatron.current_file_path}/tmp/pids/captive_portal.pid"
      SystemMonit.add(:publish_to_web, start, stop, pid_file)
    end
    
    def service_command
      public_interface = "foo"
      external_interface = "bar"
      "/usr/bin/sudo #{configatron.current_file_path}/script/init/captive_portal #{configatron.current_file_path} #{public_interface} #{external_interface}"
    end
    
  end

end
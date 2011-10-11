class SystemVpn
  
  class << self
    def monitor_service
      return if SystemMonit.exists?(:vpn) && SystemMonit.start(:vpn)
      start = service_command("start")
      stop  = service_command("stop")
      pid_file = "#{configatron.current_file_path}/tmp/pids/edge.pid"
      SystemMonit.add(:vpn, start, stop, pid_file)
    end
    
    def service_command(argument)
      "/usr/bin/sudo /home/protonet/dashboard/current/script/init/vpn #{argument} #{SystemPreferences.vpn[:identifier]} #{SystemPreferences.vpn[:password]}"
    end
    
    def start
      return unless Rails.env == 'production'
      monitor_service
    end
  
    def stop
      return unless Rails.env == 'production'
      SystemMonit.remove(:vpn) if SystemMonit.exists?(:vpn)
    end
  
    def status
      return false unless Rails.env == 'production'
      system(service_command('status')) 
    end
  end

end
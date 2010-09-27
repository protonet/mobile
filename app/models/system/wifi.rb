module System
  class Wifi
    
    class << self
      def start
        return unless Rails.env == 'production'
        monitor_service
        System::Monit.start(:wifi)
      end
    
      def stop
        return unless Rails.env == 'production'
        System::Monit.stop(:wifi)
      end
    
      def status
        return 'off' unless Rails.env == 'production'
        "on or off who knows"
      end
      
      def monitor_service
        return if System::Monit.exists?(:wifi)
        config
        start = "#{configatron.current_file_path}/script/init/wifi #{configatron.current_file_path} start"
        stop  = "#{configatron.current_file_path}/script/init/wifi #{configatron.current_file_path} start"
        pid_file = "#{configatron.current_file_path}/tmp/pids/hostapd.pid"
        System::Monit.add(:wifi, start, stop, pid_file)
      end
      
      def config
        return 'only available in production' unless Rails.env == 'production'
        config_file = "#{configatron.shared_file_path}/config/hostapd.d/config"
        FileUtils.cp("config/defaults/hostapd.conf", config_file) unless File.exists?(config_file)
        File.read(config_file)
      end
    end

  end
end
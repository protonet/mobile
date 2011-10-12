class SystemWifi

  class << self
    def start
      return unless Rails.env == 'production'
      if SystemMonit.exists?(:wifi)
        SystemMonit.start(:wifi)
      else
        monitor_service
      end
    end
  
    def stop
      return unless Rails.env == 'production'
      SystemMonit.remove(:wifi) if SystemMonit.exists?(:wifi)
    end
    
    def restart
      return unless Rails.env == 'production'
      if SystemMonit.exists?(:wifi)
        SystemMonit.restart(:wifi)
      else
        monitor_service
      end
    end
    
    def status(interface)
      !!SystemBackend.get_interfaces[interface]
    end
      
    def monitor_service
      return if SystemMonit.exists?(:wifi)
      start = service_command("start")
      stop  = service_command("stop")
      pid_file = "#{configatron.current_file_path}/tmp/pids/hostapd.pid"
      SystemMonit.add(:wifi, start, stop, pid_file)
    end
        
    def config
      return 'only available in production' unless Rails.env == 'production'
      config_file = "#{configatron.shared_file_path}/config/hostapd.d/config"
      generate_config(SystemPreferences.wifi_mode) unless File.exists?(config_file)
      File.read(config_file)
    end
    
    def service_command(argument)
      "/usr/bin/sudo #{configatron.current_file_path}/script/init/wifi #{argument}"
    end
    
    def reconfigure!
      return unless Rails.env == 'production'
      ["wlan0", "wlan1"].each do |interface|
        SystemDnsmasq.stop(interface, false) # reload set to false
        SystemConnectionSharing.stop(interface)
      end
      # reload monit
      SystemMonit.reload!
      sleep 5
      # and start with new config
      settings = ""
      case SystemPreferences.wifi["mode"]
      when :dual
        settings += default_settings
        settings += "\nchannel=#{SystemPreferences.wifi["channel"]}"
        settings += "\nssid=#{SystemPreferences.wifi["wlan0"]["name"]}\ninterface=wlan0\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan0"]["name"], SystemPreferences.wifi["wlan0"]["password"])
        settings += "\nbss=wlan1\nssid=#{SystemPreferences.wifi["wlan1"]["name"]}\nbssid=00:13:10:95:fe:0b\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan0"]["name"], SystemPreferences.wifi["wlan1"]["password"])
        generate_config(settings)
        restart
        sleep 15
        ["wlan0", "wlan1"].each do |interface|
          SystemDnsmasq.start(interface)
          SystemConnectionSharing.start(interface) if SystemPreferences.wifi[interface]["sharing"]
        end
      when "wlan0"
        settings += default_settings
        settings += "\nchannel=#{SystemPreferences.wifi["channel"]}"
        settings += "\nssid=#{SystemPreferences.wifi["wlan0"]["name"]}\ninterface=wlan0\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan0"]["name"], SystemPreferences.wifi["wlan0"]["password"])
        generate_config(settings)
        restart
        sleep 15
        SystemDnsmasq.start("wlan0")
        SystemConnectionSharing.start("wlan0") if SystemPreferences.wifi["wlan0"]["sharing"]
      when "wlan1"
        # we're still using the same interface only the settings change
        settings += default_settings
        settings += "\nchannel=#{SystemPreferences.wifi["channel"]}"
        settings += "\nssid=#{SystemPreferences.wifi["wlan1"]["name"]}\ninterface=wlan0\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan1"]["name"], SystemPreferences.wifi["wlan1"]["password"])
        generate_config(settings)
        restart
        sleep 15
        SystemDnsmasq.start("wlan0")
        SystemConnectionSharing.start("wlan0") if SystemPreferences.wifi["wlan0"]["sharing"]
      when nil
        #  shut down both
        stop
      end
    end
    
    private
    def default_settings
      # whitespaces are important
      "ctrl_interface=/var/run/hostapd
driver=nl80211
hw_mode=g
wme_enabled=1
ieee80211n=1
ht_capab=[HT40-][SHORT-GI-40][DSSS_CCK-40]"
    end
    
    def wpa_settings(ssid_name, password)
      return "\n" if password.blank?
      # whitespaces are important
      "macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_psk=#{SystemBackend.wpa_passphrase(ssid_name, password)}
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP\n"
    end
    
    def generate_config(config)
      return unless Rails.env == 'production'
      config_file = "#{configatron.shared_file_path}/config/hostapd.d/config"
      File.open(config_file, 'w') {|f| f.write(config) }
    end
    
  end
end

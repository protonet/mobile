class SystemWifi
  include Rabbit
  
  class << self
    
    def supported?
      # TODO: use iwconfig here (didn't work out for me)
      return true if Rails.env != "production"
      # Our VMs don't support lspci
      lspci = `lspci` || ""
      lspci.include?("Wireless Network") || lspci.include?("Atheros")
    end
    
    # eg. SystemWifi.supports_standard?("wlan0", "n")
    def supports_standard?(interface, standard)
      !!`/sbin/iwconfig #{interface}`.match(/\s+IEEE\s+802\.11\w*?#{standard}/)
    end
    
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
        SystemMonit.stop(:wifi)
        sleep 5
        SystemMonit.start(:wifi)
      else
        monitor_service
      end
    end
    
    def status(interface)
      !!SystemBackend.get_active_interfaces[interface]
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
      sleep 10
      # and start with new config
      settings = ""
      settings += default_settings
      settings += channel_settings(SystemPreferences.wifi["channel"])
      
      case SystemPreferences.wifi["mode"]
      when :dual
        settings += "ssid=#{SystemPreferences.wifi["wlan0"]["name"]}\ninterface=wlan0\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan0"]["name"], SystemPreferences.wifi["wlan0"]["password"])
        settings += "\nbss=wlan1\nssid=#{SystemPreferences.wifi["wlan1"]["name"]}\nbssid=00:13:10:95:fe:0b\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan1"]["name"], SystemPreferences.wifi["wlan1"]["password"])
        generate_config(settings)
        restart
        sleep 10
        ["wlan0", "wlan1"].each do |interface|
          SystemDnsmasq.start(interface)
          SystemConnectionSharing.start(interface) if SystemPreferences.wifi[interface]["sharing"]
        end
      when "wlan0"
        settings += "ssid=#{SystemPreferences.wifi["wlan0"]["name"]}\ninterface=wlan0\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan0"]["name"], SystemPreferences.wifi["wlan0"]["password"])
        generate_config(settings)
        restart
        sleep 10
        SystemDnsmasq.start("wlan0")
        SystemConnectionSharing.start("wlan0") if SystemPreferences.wifi["wlan0"]["sharing"]
      when "wlan1"
        settings += "ssid=#{SystemPreferences.wifi["wlan1"]["name"]}\ninterface=wlan0\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan1"]["name"], SystemPreferences.wifi["wlan1"]["password"])
        generate_config(settings)
        restart
        sleep 10
        SystemDnsmasq.start("wlan0")
        SystemConnectionSharing.start("wlan0") if SystemPreferences.wifi["wlan0"]["sharing"]
      when nil
        #  shut down both
        stop
      end
    end
    
    private
    
    def channel_settings(channel)
      # This might only work with AR9285 chipset
      # [HT40-] = enable 40 mhz secondary channel below primary channel (channel bonding)
      # [HT40+] = enable 40 mhz secondary channel above primary channel (channel bonding)
      # [RX-STBC123] = 1, 2 or 3 spatial streams
      # [SHORT-GI-20] = short guard intervals for 20 mhz
      # [SHORT-GI-40] = short guard intervals for 40 mhz
      channel_width_set = channel < 8 ? "+" : "-"
      ht_capab = "[HT20][HT40#{channel_width_set}][SHORT-GI-20][SHORT-GI-40][DSSS_CCK-40][MAX-AMSDU-3839][TX-STBC][RX-STBC123]"
      "channel=#{channel}\nht_capab=#{ht_capab}\n"
    end
    
    def default_settings
      # whitespaces are important
      "ctrl_interface=/var/run/hostapd
driver=nl80211
hw_mode=g
#{'ieee80211n=1' if supports_standard?('wlan0', 'n')}
ieee80211d=1
country_code=US
wme_enabled=1
wmm_enabled=1\n"
    end
    
    def wpa_settings(ssid_name, password)
      return "\n" if password.blank?
      # whitespaces are important
      "macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_key_mgmt=WPA-PSK
rsn_pairwise=CCMP
wpa_psk=#{SystemBackend.wpa_passphrase(ssid_name, password)}
wpa_group_rekey=3000
wpa_ptk_rekey=3000\n"
    end
    
    def generate_config(config)
      return unless Rails.env == 'production'
      config_file = "#{configatron.shared_file_path}/config/hostapd.d/config"
      File.open(config_file, 'w') {|f| f.write(config) }
    end
    
  end
end

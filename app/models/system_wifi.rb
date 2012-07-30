class SystemWifi
  include Rabbit
  
  class << self
    
    def supported?
      return true unless Rails.env.production?
      # Note: Our VMs don't support lspci
      lspci = `lspci` || ""
      lspci.include?("Wireless Network") || lspci.include?("Atheros")
    end
    
    # eg. SystemWifi.supports_standard?("wlan0", "n")
    def supports_standard?(interface, standard)
      !!`/sbin/iwconfig #{interface}`.match(/\s+IEEE\s+802\.11\w*?#{standard}/)
    end
    
    def start
      return unless Rails.env.production?
      if SystemMonit.exists?(:wifi)
        SystemMonit.start(:wifi)
      else
        monitor_service
      end
    end
  
    def stop
      return unless Rails.env.production?
      SystemMonit.remove(:wifi) if SystemMonit.exists?(:wifi)
    end
    
    def restart
      return unless Rails.env.production?
      if SystemMonit.exists?(:wifi)
        SystemMonit.restart(:wifi)
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
    
    def service_command(argument)
      "/usr/bin/sudo #{configatron.current_file_path}/script/init/wifi #{argument}"
    end
    
    def reconfigure!
      return unless Rails.env.production?
      
      ["wlan0", "wlan1"].each do |interface|
        SystemDnsmasq.stop(interface, false) # reload set to false
        SystemConnectionSharing.stop(interface)
      end
      
      SystemMonit.reload!
      sleep 10
      
      generate_config
      
      case SystemPreferences.wifi["mode"]
      when :dual
        restart
        sleep 10
        ["wlan0", "wlan1"].each do |interface|
          SystemDnsmasq.start(interface)
          SystemConnectionSharing.start(interface) if SystemPreferences.wifi[interface]["sharing"]
        end
      when "wlan0"
        restart
        sleep 10
        SystemDnsmasq.start("wlan0")
        SystemConnectionSharing.start("wlan0") if SystemPreferences.wifi["wlan0"]["sharing"]
      when "wlan1"
        restart
        sleep 10
        SystemDnsmasq.start("wlan0")
        SystemConnectionSharing.start("wlan0") if SystemPreferences.wifi["wlan0"]["sharing"]
      when nil
        #  shut down both
        stop
      end
    end
    
    def generate_config
      return unless Rails.env.production?
      
      settings = ""
      settings += default_settings
      settings += "channel=#{SystemPreferences.wifi["channel"]}\n"
      settings += "ht_capab=#{ht_capabilities(SystemPreferences.wifi["channel"])}\n"
      
      case SystemPreferences.wifi["mode"]
      when :dual
        settings += "ssid=#{SystemPreferences.wifi["wlan0"]["name"]}\ninterface=wlan0\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan0"]["name"], SystemPreferences.wifi["wlan0"]["password"])
        settings += "\nbss=wlan1\nssid=#{SystemPreferences.wifi["wlan1"]["name"]}\nbssid=00:13:10:95:fe:0b\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan1"]["name"], SystemPreferences.wifi["wlan1"]["password"])
      when "wlan0"
        settings += "ssid=#{SystemPreferences.wifi["wlan0"]["name"]}\ninterface=wlan0\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan0"]["name"], SystemPreferences.wifi["wlan0"]["password"])
      when "wlan1"
        settings += "ssid=#{SystemPreferences.wifi["wlan1"]["name"]}\ninterface=wlan0\n"
        settings += wpa_settings(SystemPreferences.wifi["wlan1"]["name"], SystemPreferences.wifi["wlan1"]["password"])
      when nil
        #  shut down both
        stop
        return
      end
      
      config_file = "#{configatron.shared_file_path}/config/hostapd.d/config"
      File.open(config_file, 'w') {|f| f.write(settings) }
    end
    
    private
    
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
wpa_group_rekey=0
wpa_ptk_rekey=0
wpa_gmk_rekey=0\n"
    end
    
    def ht_capabilities(channel)
      channel_width_set = channel < 8 ? "+" : "-"
      
      iw_info           = `/usr/bin/iw phy0 info`
      iw_info           = iw_info.match(/band 1\:[\S\s]+?capabilities\:([\S\s]+?)frequencies\:/i)[1] rescue ""
      iw_info           = iw_info.upcase
      
      ht_capab          = ""
      # CHANNEL WIDTH (aka: CHANNEL BONDING): http://wifijedi.com/2009/01/25/how-stuff-works-channel-bonding/
      ht_capab         += "[HT20]"                      if iw_info.include?("HT20")
      ht_capab         += "[HT40#{channel_width_set}]"  if iw_info.include?("HT40")
      # SHORT GUARD INTERVAL: http://wifijedi.com/2009/02/11/how-stuff-works-short-guard-interval/
      ht_capab         += "[SHORT-GI-20]"               if iw_info.include?("HT20 SGI")
      ht_capab         += "[SHORT-GI-40]"               if iw_info.include?("HT40 SGI")
      ht_capab         += "[DSSS_CCK-40]"               if iw_info.include?("DSSS/CCK HT40")
      # FRAME AGGREGATION: http://en.wikipedia.org/wiki/Frame_aggregation
      ht_capab         += "[MAX-AMSDU-3839]"            if iw_info.include?("MAX AMSDU LENGTH: 3839")
      # SPATIAL STREAMS: http://wifijedi.com/2009/02/01/how-stuff-works-spatial-multiplexing/
      ht_capab         += "[TX-STBC]"                   if iw_info.include?("TX STBC")
      ht_capab         += "[RX-STBC1]"                  if iw_info.include?("RX STBC 1")
      
      ht_capab
    end
    
  end
end

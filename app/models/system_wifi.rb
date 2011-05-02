class SystemWifi
  
  SETTINGS = {
    :default => 
"ctrl_interface=/var/run/hostapd
driver=nl80211
hw_mode=g
channel=3
wme_enabled=1
ieee80211n=1
ht_capab=[HT40-][SHORT-GI-40][DSSS_CCK-40]",
    :single =>
"ssid=private
interface=wlan0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=hheg45$%00
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP",
    :dual => 
"ssid=private
interface=wlan0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=hheg45$%00
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
bss=wlan1
ssid=public
bssid=00:13:10:95:fe:0b"
  }
  
  class << self
    def start
      return unless Rails.env == 'production'
      monitor_service
      SystemMonit.start(:wifi)
    end
  
    def stop
      return unless Rails.env == 'production'
      SystemMonit.remove(:wifi) if SystemMonit.exists?(:wifi)
    end
    
    def restart
      return unless Rails.env == 'production'
      SystemMonit.restart(:wifi)
    end
  
    def status
      return 'off' unless Rails.env == 'production'
      system(service_command("status")) ? 'on' : 'off'
    end
  
    def switch_mode(type)
      return false unless [:single, :dual].include?(type)
      generate_config(type)
      SystemPreferences.wifi_mode = type
      (type == :single ? {'wlan0' => '10.42.0.1'} : {'wlan0' => '10.42.0.1', 'wlan1' => '10.43.0.1'}).each do |interface, ip|
        SystemDnsmasq.add_interface(interface, ip)
        SystemDnsmasq.restart(interface)
      end
      restart
    end
    
    def monitor_service
      return if SystemMonit.exists?(:wifi)
      switch_mode(SystemPreferences.wifi_mode)
      start = service_command("start")
      stop  = service_command("stop")
      pid_file = "#{configatron.current_file_path}/tmp/pids/hostapd.pid"
      SystemMonit.add(:wifi, start, stop, pid_file)
    end
    
    def generate_config(type)
      config_file = "#{configatron.shared_file_path}/config/hostapd.d/config"
      File.open(config_file, 'w') {|f| f.write(SETTINGS[:default] + "\n\n" + SETTINGS[type]) }
    end
    
    def config
      return 'only available in production' unless Rails.env == 'production'
      config_file = "#{configatron.shared_file_path}/config/hostapd.d/config"
      generate_config(SystemPreferences.wifi_mode) unless File.exists?(config_file)
      File.read(config_file)
    end
    
    def service_command(argument)
      "/usr/bin/sudo #{configatron.current_file_path}/script/init/wifi #{configatron.current_file_path} #{argument}"
    end
    
  end
end
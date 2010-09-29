module System
  class Wifi
    
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
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_pairwise=CCMP
wpa_passphrase=hheg45$%00",
      :dual => 
"ssid=private
interface=wlan0
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_pairwise=CCMP
wpa_passphrase=hheg45$%00
bss=wlan1
ssid=public
bssid=00:13:10:95:fe:0b"
    }
    
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
      
      def restart
        return unless Rails.env == 'production'
        monitor_service
        System::Monit.restart(:wifi)
      end
    
      def status
        return 'off' unless Rails.env == 'production'
        "on or off who knows"
      end

      def switch_mode(type)
        return false unless [:single, :dual].include?(type)
        generate_config(type)
        System::Preferences.wifi_mode = type
        (type == :single ? {'wlan0' => '10.42.0.1'} : {'wlan0' => '10.42.0.1', 'wlan1' => '10.43.0.1'}).each do |interface, ip|
          System::Networking.config_wifi_interface(interface, ip)
          System::Dnsmasq.add_interface(interface, ip)
        end
        System::Dnsmasq.restart
        restart
      end
      
      def monitor_service
        return if System::Monit.exists?(:wifi)
        switch_mode(System::Preferences.wifi_mode)
        start = "/usr/bin/sudo #{configatron.current_file_path}/script/init/wifi #{configatron.current_file_path} start"
        stop  = "/usr/bin/sudo #{configatron.current_file_path}/script/init/wifi #{configatron.current_file_path} stop"
        pid_file = "#{configatron.current_file_path}/tmp/pids/hostapd.pid"
        System::Monit.add(:wifi, start, stop, pid_file)
      end
      
      def generate_config(type)
        config_file = "#{configatron.shared_file_path}/config/hostapd.d/config"
        File.open(config_file, 'w') {|f| f.write(SETTINGS[:default] + "\n\n" + SETTINGS[type]) }
      end
      
      def config
        return 'only available in production' unless Rails.env == 'production'
        config_file = "#{configatron.shared_file_path}/config/hostapd.d/config"
        generate_config(System::Preferences.wifi_mode) unless File.exists?(config_file)
        File.read(config_file)
      end
      
    end

  end
end
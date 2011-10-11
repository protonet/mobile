module Preferences
  class WifiController < ApplicationController
    
    def update
      # handle wlan0, wlan1, dual stuff
      current_interface = params['interface']
      other_interface   = current_interface == "wlan0" ? "wlan1" : "wlan0"
      wifi              = params["preferences"]["wifi"]    == "true"
      sharing           = params["preferences"]["sharing"] == "true"
      password          = params["preferences"]["password"]
      
      if !password.blank? && password.size < 8
        flash[:error] = 'The password must be at least 8 characters long'
        return respond_to_preference_update(417)
      end
      
      wifi_preferences = SystemPreferences.wifi
      wifi_preferences[current_interface].merge!({ "password" => password, "sharing" => sharing })
      
      other_interface_active    = wifi_preferences["mode"] == :dual || wifi_preferences["mode"] == other_interface
      current_interface_active  = wifi
      
      wifi_preferences["mode"] = if other_interface_active && current_interface_active
        :dual
      elsif other_interface_active
        other_interface
      elsif current_interface_active
        current_interface
      else
        nil
      end
      
      SystemPreferences.wifi = wifi_preferences # if check is ok
      Rails.logger.info(SystemPreferences.wifi.inspect)
      SystemWifi.reconfigure!
      
      flash[:notice] = "Your WiFi configuration has been successfully saved"
      respond_to_preference_update
    end
    
    def interface_status
      render :partial => 'interface_status', :locals => { :interface => params[:interface] }
    end
    
  end
end
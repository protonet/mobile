module Preferences
  class WifiController < ApplicationController
    
    def update
      wifi_preferences = SystemPreferences.wifi
      wlan0_active = params["preferences"]["wlan0"]["wifi"] == "true"
      wlan1_active = params["preferences"]["wlan1"]["wifi"] == "true"
      
      ["wlan0", "wlan1"].each do |interface|
        wifi      = params["preferences"][interface]["wifi"]    == "true"
        sharing   = params["preferences"][interface]["sharing"] == "true"
        password  = params["preferences"][interface]["password"]
        
        if !password.blank? && password.size < 8
          flash[:error] = "The password for #{interface} must be at least 8 characters long"
          return respond_to_preference_update(417)
        end
        
        wifi_preferences[interface].merge!({ "password" => password, "sharing" => sharing })
      end
      
      wifi_preferences["mode"] = if wlan0_active && wlan1_active
        :dual
      elsif wlan0_active
        "wlan0"
      elsif wlan1_active
        "wlan1"
      else
        nil
      end
      
      wifi_preferences["channel"] = params["preferences"]["channel"].to_i
      
      SystemPreferences.wifi = wifi_preferences
      SystemWifi.reconfigure!
      
      flash[:notice] = "Your WLAN configuration has been successfully saved"
      respond_to_preference_update
    end
    
    def interface_status
      render :partial => 'interface_status', :locals => { :interface => params[:interface] }
    end
    
  end
end
module Preferences
  class WifiController < ApplicationController
    
    def update
      # handle wlan0, wlan1, dual stuff
      wifi_params     = params["preferences"]["wifi"]
      sharing_params  = params["preferences"]["sharing"]
      password_params = params["preferences"]["password"]
      
      wifi_preferences = SystemPreferences.wifi
      
      wifi_preferences["mode"] = if wifi_params["wlan0"] && wifi_params["wlan1"]
        :dual
      else
        wifi_params.find {|iface| iface[1]}.try(:[], 0)
      end
      ["wlan0", "wlan1"].each do |iface|
        wifi_preferences[iface] = {"password" => password_params[iface], "sharing" => sharing_params[iface]}
      end
      
      SystemPreferences.wifi = wifi_preferences # if check is ok

      # SystemWifi.reconfigure!

      render :text => "barbaz"
    end
    
    def on
      SystemWifi.start
      respond_to do |format|
        format.html {redirect_to :controller => '/preferences', :action => 'index', :anchor => 'wifi_settings'}
        format.js  { render :json => {:status => 'on'} }
      end
    end
    
    def off
      SystemWifi.stop
      respond_to do |format|
        format.html {redirect_to :controller => '/preferences', :action => 'index', :anchor => 'wifi_settings'}
        format.js  { render :json => {:status => 'off'} }
      end
    end
    
  end
end
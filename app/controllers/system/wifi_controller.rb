module System
  class WifiController < ApplicationController
    
    def on
      System::Wifi.start
      respond_to do |format|
        format.html
        format.js  { render :json => {:status => 'on'} }
      end
    end
    
    def off
      System::Wifi.stop
      respond_to do |format|
        format.html
        format.js  { render :json => {:status => 'off'} }
      end
    end
    
  end
end
module Preferences
  class WifiController < ApplicationController
    
    def update
      # handle single, dual stuff
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
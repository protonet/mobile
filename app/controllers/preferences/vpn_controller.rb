module Preferences
  class VpnController < ApplicationController
    
    def on
      SystemVpn.start
      respond_to do |format|
        format.html
        format.js  { render :json => {:status => 'on'} }
      end
    end
    
    def off
      SystemVpn.stop
      respond_to do |format|
        format.html
        format.js  { render :json => {:status => 'off'} }
      end
    end
    
  end
end
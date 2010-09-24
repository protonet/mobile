module System
  class VpnController < ApplicationController
    
    def on
      System::Vpn.start
      respond_to do |format|
        format.html
        format.js  { render :json => {:status => 'on'} }
      end
    end
    
    def off
      System::Vpn.stop
      respond_to do |format|
        format.html
        format.js  { render :json => {:status => 'off'} }
      end
    end
    
  end
end
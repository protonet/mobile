module Preferences
  class VpnController < ApplicationController
    def update
      vpn_status = params[:vpn_status] == "true"
      vpn_status ? SystemVpn.start : SystemVpn.stop
      flash[:notice] = "The VPN system has been turned " + (vpn_status ? "on" : "off")
      if request.xhr?
        head(204)
      else
        redirect_to :controller => '/preferences', :action => 'show', :section => 'vpn_settings'
      end
    end
  end
end
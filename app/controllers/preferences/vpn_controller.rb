module Preferences
  class VpnController < ApplicationController
    filter_access_to :all, :context => :preferences
    
    def update
      vpn_status = params[:vpn_status] == "true"
      vpn_status ? SystemVpn.start : SystemVpn.stop
      flash[:notice] = "The VPN system has been turned " + (vpn_status ? "on" : "off")
      respond_to_preference_update
    end
  end
end
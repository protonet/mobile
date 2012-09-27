module Preferences
  class VpnController < ApplicationController
    filter_access_to :all, :context => :preferences
    
    def update
      vpn_status = params[:vpn_status] == "true"
      vpn_status ? SystemVpn.start : SystemVpn.stop
      flash[:notice] = t("flash_message_saved_successfully")
      respond_to_preference_update
    end
  end
end
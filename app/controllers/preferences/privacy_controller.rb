module Preferences
  class PrivacyController < ApplicationController
    filter_access_to :all, :context => :preferences

    def update
      success = false
      if params[:preferences]
        params[:preferences].each do |key, value|
          params[:preferences][key] = value == "true"
        end
        
        interface = params[:interface]
        current_settings = SystemPreferences.privacy
        current_settings[interface] ||= {}
        current_settings[interface].merge!(params[:preferences])
        SystemPreferences.privacy = current_settings
        success = SystemPreferences.privacy == current_settings
      end
      
      if success
        flash[:notice] = t("flash_message_saved_success")
      else
        flash[:error] = t("preferences.flash_message_saved_error")
      end
      
      respond_to_preference_update
    end
  end
end
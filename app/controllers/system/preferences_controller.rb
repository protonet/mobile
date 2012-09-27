module System
  class PreferencesController < ApplicationController

    filter_access_to :all, :context => :preferences
    
    def update
      (params[:preferences] || []).each do |k,v|
        v = eval(v) if ['false', 'true'].include?(v)
        SystemPreferences[k] = v
      end
      
      flash[:notice] = t("flash_message_saved_success")
      respond_to_preference_update
    end
  end
end
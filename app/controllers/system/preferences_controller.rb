module System
  class PreferencesController < ApplicationController

    filter_access_to :all, :context => :preferences
    
    def update
      (params[:preferences] || []).each do |k,v|
        v = eval(v) if ['false', 'true'].include?(v)
        SystemPreferences[k] = v
      end
      
      flash[:notice] = "Your preferences have been successfully saved"
      respond_to_preference_update
    end
  end
end
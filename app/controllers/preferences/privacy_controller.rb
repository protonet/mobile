module Preferences
  class PrivacyController < ApplicationController
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
        flash[:notice] = "Successfully saved."
      else
        flash[:error] = "There has been an error saving your preferences."
      end
      
      if request.xhr?
        head(204)
      else
        redirect_to :controller => '/preferences', :action => :show, :section => params[:section]
      end
    end
  end
end
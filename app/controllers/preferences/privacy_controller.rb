module Preferences
  class PrivacyController < ApplicationController
    def update
      success = nil
      if(params[:preferences])
        key   = params[:preferences].keys.first
        value = params[:preferences][key] == "true"
        interface = params[:interface]
        current_settings = SystemPreferences.privacy
        current_settings[interface] ||= {}
        current_settings[interface].merge!({key => value})
        SystemPreferences.privacy = current_settings
        success = "#{interface} #{key} #{value}" if SystemPreferences.privacy == current_settings
      end
      response = if success
        {:type => :notice, :message => "Setting #{success} was saved."}
      else
        {:type => :error, :message => "Setting #{success} was NOT saved."}
      end
      respond_to do |format|
        format.js { render :json => response, :status => (success ? :ok : :error), :content_type => "application/json" }
      end
    end
  end
end
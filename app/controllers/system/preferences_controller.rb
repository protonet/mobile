module System
  class PreferencesController < ApplicationController
    
    def update
      (params[:preferences] || []).each do |k,v|
        v = eval(v) if ['false', 'true'].include?(v)
        System::Preferences[k] = v
      end
      respond_to do |format|
        format.html { redirect_to preferences_path(:anchor => 'system_overview') }
        format.js { head :ok }
      end
    end
    
  end
end
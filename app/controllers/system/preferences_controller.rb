module System
  class PreferencesController < ApplicationController
    
    def update
      (params[:preferences] || []).each do |k,v|
        v = eval(v) if ['false', 'true'].include?(v)
        SystemPreferences[k] = v
      end
      
      flash[:notice] = "Your preferences have been successfully saved"
      if request.xhr?
        head(204)
      else
        redirect_to :controller => '/preferences', :action => :show, :section => params[:section]
      end
    end
    
  end
end
module System
  class PreferencesController < ApplicationController
    
    def update
      head :error unless preferences = params[:preferences]
      preferences.each do |k,v|
        v = eval(v) if ['false', 'true'].include?(v)
        System::Preferences[k] = v
      end
      head :ok
    end
    
  end
end
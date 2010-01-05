class PreferencesController < ApplicationController
  
  def index
    @preferences = [
      {:url => 'profile', :name => 'your profile'},
      {:url => 'network_settings', :name => 'network settings'},
      {:url => 'wifi_settings', :name => 'wifi settings'}, 
      {:url => 'system_overview', :name => 'system overview'}]
  end
  
  def profile
    render :partial => 'profile'
  end
  
  def network_settings
    @network_interfaces = System::Backend.get_interfaces
    render :partial => 'network_settings'
  end
  
  def wifi_settings
    render :partial => 'wifi_settings'
  end
  
  def system_overview
    render :partial => 'system_overview'
  end
  
end

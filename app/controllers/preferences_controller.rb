class PreferencesController < ApplicationController
  
  def index
    @preferences = [
      {:url => 'profile', :name => 'your profile'},
      {:url => 'node_settings', :name => 'node settings'},
      {:url => 'network_settings', :name => 'network settings'},
      {:url => 'wifi_settings', :name => 'wifi settings'}, 
      {:url => 'system_overview', :name => 'system overview'}]
  end
  
  def profile
    render :partial => 'profile'
  end
  
  def node_settings
    @node = Network.local
    
    if request.put?
      if @node.update_attributes(params[:network])
        # TODO: send out the new info (via negotiating)
        render :text => 'The local node information has been updated.'
        return
      end
    end
    
    render :partial => 'node_settings'
  end
  
  def network_settings
    @interfaces = {}
    System::Backend.get_interfaces.each do |interface|
      @interfaces[interface.keys.first] = interface.values.first
    end
    
    render :partial => 'network_settings'
  end
  
  def wifi_settings
    render :partial => 'wifi_settings'
  end
  
  def system_overview
    render :partial => 'system_overview'
  end
  
end

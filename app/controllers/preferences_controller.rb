class PreferencesController < ApplicationController
  before_filter :only_registered
  
  def index
    @preferences = current_user.roles.include?(Role.find_by_title!('admin')) ? [
      {:url => 'profile', :name => 'your profile'},
      {:url => 'node_settings', :name => 'node settings'},
      {:url => 'network_settings', :name => 'network settings'},
      {:url => 'wifi_settings', :name => 'wifi settings'}, 
      {:url => 'captive_settings', :name => 'captive settings'},
      {:url => 'vpn_settings', :name => 'vpn settings'},
      {:url => 'software_updates', :name => 'software updates'}
    ] : [
      {:url => 'profile', :name => 'your profile'}
    ]
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
    @interfaces = SystemBackend.get_interfaces
    render :partial => 'network_settings'
  end
  def interface
    render :text => SystemBackend.get_interface_information(params[:id]).inspect.gsub(',', ',<br/> &nbsp; ')
  end
  
  def wifi_settings
    render :partial => 'wifi_settings'
  end
  
  def captive_settings
    render :partial => 'captive_settings'
  end
  
  def vpn_settings
    render :partial => 'vpn_settings'
  end
  
  def user_settings
    render :partial => 'user_settings'
  end
  
  def software_updates
    render :partial => 'software_updates'
  end
  
  def get_vpn
    render :json => {
      'description' => Network.local.name,
      'community' => SystemPreferences.vpn[:identifier],
      'key' => SystemPreferences.vpn[:password]
    }
  end

end

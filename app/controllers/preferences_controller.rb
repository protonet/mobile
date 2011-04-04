class PreferencesController < ApplicationController
  before_filter :only_registered
  
  def index
    @preferences = current_user.roles.include?(Role.find_by_title!('admin')) ? [
      {:url => 'profile', :name => 'your profile'},
      {:url => 'node_settings', :name => 'node settings'},
      {:url => 'network_settings', :name => 'network settings'},
      {:url => 'wifi_settings', :name => 'wifi settings'}, 
      {:url => 'system_overview', :name => 'system overview'},
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
    @interfaces = System::Backend.get_interfaces
    render :partial => 'network_settings'
  end
  def interface
    render :text => System::Backend.get_interface_information(params[:id]).inspect.gsub(',', ',<br/> &nbsp; ')
  end
  
  def wifi_settings
    render :partial => 'wifi_settings'
  end
  
  def system_overview
    render :partial => 'system_overview'
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
      'community' => System::Preferences.vpn[:identifier],
      'key' => System::Preferences.vpn[:password]
    }
  end

end

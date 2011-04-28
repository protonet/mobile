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
  
  def interface
    render :text => SystemBackend.get_interface_information(params[:id]).inspect.gsub(',', ',<br/> &nbsp; ')
  end
  
  def get_vpn
    render :json => {
      'description' => Network.local.name,
      'community' => SystemPreferences.vpn[:identifier],
      'key' => SystemPreferences.vpn[:password]
    }
  end
  
  def method_missing(method, *args)
    methods = ["profile", "node_settings", "network_settings", "wifi_settings", "captive_settings", "vpn_settings", "user_settings", "software_updates"]
    if methods.include?(method.to_s)
      return render :partial => method.to_s
    end
    super(method, *args) 
  end

end

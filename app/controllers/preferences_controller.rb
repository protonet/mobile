class PreferencesController < ApplicationController
  # filter_resource_access
  before_filter :only_registered
  before_filter :set_available_preferences
  
  def index
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

  def set_available_preferences
    @preferences = current_user.roles.include?(Role.find_by_title!('admin')) ? [
      {:url => 'profile', :name => 'your profile'},
      {:url => 'node_settings', :name => 'node settings'},
      {:url => 'network_settings', :name => 'network settings'},
      {:url => 'pppoe_settings', :name => 'pppoe settings'},
      {:url => 'wifi_settings', :name => 'wifi settings'}, 
      {:url => 'captive_settings', :name => 'captive settings'},
      {:url => 'webhook_settings', :name => 'webhook settings'},
      {:url => 'privacy_settings', :name => 'privacy settings'},
      {:url => 'vpn_settings', :name => 'vpn settings'},
      {:url => 'software_updates', :name => 'software updates'}
    ] : [
      {:url => 'profile', :name => 'your profile'}
    ]
  end

  def method_missing(method, *args)
    methods = @preferences.collect {|preference| preference[:url]}
    if methods.include?(method.to_s)
      return render :partial => method.to_s
    end
    super(method, *args) 
  end

end

class NodesController < ApplicationController
  filter_resource_access
  
  def update
    node = Node.find(params[:id])
    if node.update_attributes(params[:node]) && node.errors.empty?
      update_wlan_ssid(node.name)
      update_browser_title(node.name)
      flash[:notice] = "Successfully updated node"
    else
      flash[:error] = "#{node.errors.full_messages.to_sentence}"
    end
    respond_to_preference_update
  end
  
  private
    def update_wlan_ssid(ssid)
      wifi_preferences = SystemPreferences.wifi
      wifi_preferences["wlan0"]["name"] = "#{ssid} (protonet-private)"
      wifi_preferences["wlan1"]["name"] = "#{ssid} (protonet-public)"
      SystemPreferences.wifi = wifi_preferences
      SystemWifi.reconfigure! if wifi_preferences["mode"]
    end
    
    def update_browser_title(name)
      SystemPreferences.browser_title = "#{name} - protonet. it's yours."
    end
end
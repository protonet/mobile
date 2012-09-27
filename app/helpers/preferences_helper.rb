module PreferencesHelper
  def network_interfaces
      current_interface = incoming_interface
      interfaces = SystemBackend.get_interfaces.collect(&:name)
      interfaces = interfaces.select {|interface| interface =~ /^(en|et|wlan).*/ }
      interfaces << "published_to_web"
      interfaces << current_interface unless interfaces.include?(current_interface)
      interfaces
    end
    
    def network_interface_description(interface_name)
      if interface_name =~ /^(en|et).*/
        t("preferences.headline_privacy_ethernet", :interface_name => interface_name)
      elsif interface_name =~ /^(wlan).*/
        t("preferences.headline_privacy_wlan", :interface_name => interface_name)
      elsif interface_name == 'published_to_web'
        t("preferences.headline_privacy_web_publishing",
          :publish_to_web_name  => SystemPreferences.publish_to_web_name,
          :href                 => preferences_path(:section => 'publish_to_web')
        )
      elsif interface_name =~ /^lo.*/
        t("preferences.headline_privacy_local", :interface_name => interface_name)
      else
        t("preferences.headline_privacy_fallback")
      end
    end

  def current_section?(section)
    return false if @selected_section.nil?
    section == @selected_section.split('/').last
  end
  
end

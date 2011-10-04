module PreferencesHelper
  def network_interfaces
    interfaces = SystemBackend.get_interfaces.collect(&:name)
    interfaces = interfaces.select {|interface| interface =~ /^(en|et|wlan).*/ }
    interfaces | ["published_to_web", "fallback"]
  end
  
  def network_interface_description(interface_name)
    if interface_name =~ /^(en|et).*/
      "Accessing protonet via ethernet/network cable <i>(interface: #{interface_name})</i>"
    elsif interface_name =~ /^(wlan).*/
      "Accessing protonet via WiFi <i>(interface: #{interface_name})</i>"
    elsif interface_name == 'published_to_web'
      "Accessing protonet via https://#{SystemPreferences.publish_to_web_name}.protonet.info<br><i>(as configured in #{link_to('Publish to web', preferences_path(:section => 'publish_to_web'))})</i>"
    else
      'Accessing from any other network interface <i>(fallback)</i>'
    end
  end
end

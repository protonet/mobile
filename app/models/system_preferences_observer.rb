class SystemPreferencesObserver < ActiveRecord::Observer
  def after_save(system_preference)
    case system_preference.var
    when "publish_to_web"
      if system_preference.value
        turn_on_publishing
        SystemPreferences.public_host = "#{SystemPreferences.publish_to_web_name}.protonet.info"
        SystemPreferences.public_host_https = true
      else
        turn_off_publishing
      end
    when "node_name", "node_description", "node_supernode", "node_key", "node_uuid"
      Network.update_local_from_preferences
    when "custom_css", "custom_javascript", "browser_title"
      system_preference.destroy if system_preference.value.blank?
    when "public_host_https"
      ActionMailer::Base.default_url_options[:protocol] = (SystemPreferences.public_host_https ? 'https' : 'http')
    when "index_meeps"
      Sunspot::IndexQueue::Entry.implementation =  (system_preference.value ? :active_record : :nil)
    end
  end
  
  private
  def turn_on_publishing
    SystemPublishToWeb.publish
  end
  
  def turn_off_publishing
    SystemPublishToWeb.unpublish
  end
end
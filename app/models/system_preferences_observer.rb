class SystemPreferencesObserver < ActiveRecord::Observer
  def after_save(system_preference)
    case system_preference.var
    when "node_name", "node_description", "node_supernode", "node_key", "node_uuid"
      Network.update_local_from_preferences
    when "public_host", "public_host_https"
      ActionMailer::Base.default_url_options[:host]     = SystemPreferences.public_host
      ActionMailer::Base.default_url_options[:protocol] = (SystemPreferences.public_host_https ? 'https' : 'http')
    when "index_meeps"
      Sunspot::IndexQueue::Entry.implementation =  (system_preference.value ? :active_record : :nil)
    when "captive"
      system_preference.value == true ? SystemCaptivePortal.start : SystemCaptivePortal.stop
    when "custom_css", "custom_javascript", "browser_title", "captive_url", "captive_authorization_url", "captive_external_interface", "captive_internal_interface", "captive_redirection_target"
      system_preference.destroy if system_preference.value.blank?
    end
  end
end
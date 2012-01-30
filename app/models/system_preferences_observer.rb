class SystemPreferencesObserver < ActiveRecord::Observer
  def after_save(system_preference)
    case system_preference.var
    when "node_name", "node_description", "node_supernode", "node_key", "node_uuid"
      Network.update_local_from_preferences
    when "public_host", "public_host_https"
      ActionMailer::Base.default_url_options[:host]     = SystemPreferences.public_host
      ActionMailer::Base.default_url_options[:protocol] = (SystemPreferences.public_host_https ? 'https' : 'http')
    when "show_search_widget"
      Sunspot::IndexQueue::Entry.implementation =  (system_preference.value ? :active_record : :nil)
    when "captive"
      system_preference.value == true ? SystemCaptivePortal.start : SystemCaptivePortal.stop
    when "local_email_delivery", "smtp_address", "smtp_domain", "smtp_username", "smtp_password"
      if system_preference.var == "local_email_delivery" && system_preference.value == true
        if ["smtp_address", "smtp_domain", "smtp_username", "smtp_password"].none? { |s| SystemPreferences[s].blank? }
          ActionMailer::Base.smtp_settings = {
            :address              => SystemPreferences.smtp_address,
            :port                 => 587,
            :domain               => SystemPreferences.smtp_domain,
            :user_name            => SystemPreferences.smtp_username,
            :password             => SystemPreferences.smtp_password,
            :authentication       => "plain",
            :enable_starttls_auto => true
          }
          ActionMailer::Base.delivery_method = :smtp
        else
          ActionMailer::Base.delivery_method = :sendmail
        end
      else
        ActionMailer::Base.delivery_method = ProtonetEmailService
      end
    when "custom_css", "custom_javascript", "browser_title", "captive_url",
      "captive_authorization_url", "captive_external_interface", "captive_internal_interface", "captive_redirection_target",
      "smtp_address", "smtp_domain", "smtp_username", "smtp_password"
      system_preference.destroy if system_preference.value.blank?
    end
  end
end
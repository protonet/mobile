class Mailer < ActionMailer::Base
  
  default_url_options[:host]      = System::Preferences.public_host
  default_url_options[:protocol]  = System::Preferences.public_host_https ? 'https' : 'http'
  
  def invitation(invitation)
    subject    'Join the Protonet'
    recipients invitation.email
    from       invitation.user.display_name
    sent_on    Time.now
    body       :invitation => invitation
  end

end

class Mailer < ActionMailer::Base
  
  default_url_options[:host] = System::Preferences.public_host
  
  def invitation(invitation)
    subject    'Join the Protonet'
    recipients invitation.email
    from       invitation.user.display_name
    sent_on    Time.now
    body       :invitation => invitation
  end

end

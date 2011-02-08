class Mailer < ActionMailer::Base
  
  default_url_options[:host] = System::Preferences.public_host
  
  def invitation(invitation)
    @invitation = invitation
    
    mail(:from => invitation.user.display_name, :to => invitation.email, :subject => 'Join the Protonet')
  end

end

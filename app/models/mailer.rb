class Mailer < ActionMailer::Base
  
  default_url_options[:host]      = SystemPreferences.public_host
  default_url_options[:protocol]  = SystemPreferences.public_host_https ? 'https' : 'http'
  
  def invitation(invitation)
    @invitation = invitation
    
    mail(:from => invitation.user.display_name, :to => invitation.email, :subject => 'Join the Protonet')
  end

end

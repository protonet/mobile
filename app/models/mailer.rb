class Mailer < ActionMailer::Base
    
  default_url_options[:host]      = SystemPreferences.public_host
  default_url_options[:protocol]  = SystemPreferences.public_host_https ? 'https' : 'http'
  
  def invitation(invitation)
    @invitation = invitation
    from = if invitation.user.email.present?
      "\"#{invitation.user.display_name}\" <#{invitation.user.email}>"
    else
      "no-reply <mailer@protonet.info>"
    end
    mail(
      :from => from,
      :to => invitation.email,
      :subject => "#{invitation.user.display_name} has invited you to join the protonet of #{Node.local.name}"
    )
  end
  
  def password_reset(password, receiver)
    @receiver = receiver
    @password = password
    from = "admin@#{SystemPreferences.public_host}"
    mail(:from => from, :to => receiver.email, :subject => "protonet password reset for #{SystemPreferences.public_host}")
  end

end

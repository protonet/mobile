class Mailer < ActionMailer::Base
  
  default_url_options[:host]      = SystemPreferences.public_host
  default_url_options[:protocol]  = SystemPreferences.public_host_https ? 'https' : 'http'
  
  def invitation(invitation)
    @invitation = invitation
    mail(
      :from => "no-reply@local.protonet.info",
      :to => invitation.email,
      :bcc => invitation.user.email,
      :reply_to => invitation.user.email,
      :subject => "#{invitation.user.display_name} wants you to join his protonet"
    )
  end
  
  def password_reset(password, receiver)
    @receiver = receiver
    @password = password
    from = "admin@#{SystemPreferences.public_host}"
    mail(:from => from, :to => receiver.email, :subject => "protonet password reset for #{SystemPreferences.public_host}")
  end

end

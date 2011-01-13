class Mailer < ActionMailer::Base
  
  def invitation(invitation)
    subject    'Awesome buddy'
    recipients invitation.email
    from       invitation.user.login
    sent_on    Time.now
    body       :invitation => invitation
  end

end

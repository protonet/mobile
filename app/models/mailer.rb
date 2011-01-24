class Mailer < ActionMailer::Base
  
  def invitation(invitation)
    subject    'Join the Protonet'
    recipients invitation.email
    from       invitation.user.display_name
    sent_on    Time.now
    body       :invitation => invitation
  end

end

module InvitationsHelper
  
  def invitation_email(invitation)
    render_to_string :partial => 'invitations/email', :locals => { :invitation => invitation }
  end
  
end

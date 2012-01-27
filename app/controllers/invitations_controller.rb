class InvitationsController < ApplicationController
  
  filter_resource_access
  
  def new
    @invitee_email = params[:invitee_email]
    @invitation = current_user.invitations.new
    @channels = current_user.owned_channels.real | Channel.public
  end
  
  def create
    @invitation = current_user.invitations.new(params[:invitation])
    
    if @invitation.save
      flash[:sticky] = "Your invitation link (#{accept_invitation_url(:invitation_token => @invitation.token, :host => SystemPreferences.public_host, :protocol => SystemPreferences.public_host_https)}) has been successfully sent!"
      head(204)
    else
      flash[:error] = @invitation.errors.full_messages.to_sentence
      head(412)
    end
  end
  
  def devise_mapping 
    @devise_mapping ||= Devise.mappings[:user]
  end
  
end
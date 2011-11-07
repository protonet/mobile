class InvitationsController < ApplicationController
  
  filter_resource_access
  
  def new
    @invitation = current_user.invitations.new
    @channels = current_user.owned_channels.real | Channel.public
  end
  
  def create
    @invitation = current_user.invitations.new(params[:invitation])
    
    if @invitation.save
      flash[:notice] = "Your invitation has been successfully sent!"
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
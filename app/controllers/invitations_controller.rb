class InvitationsController < ApplicationController
  
  filter_resource_access
  include InvitationsHelper
  
  
  before_filter :set_nav
  def set_nav
    @nav = "invitations"
  end
  
  def index
    @invitations = Invitation.order("invitee_id asc")
  end
  
  def new
    @invitee_email = params[:invitee_email]
    @invitation = current_user.invitations.new(:invitee_role => !SystemPreferences.privacy["published_to_web"]["allow_registrations_for_strangers"])
    @channels = current_user.owned_channels.real | Channel.public.local
  end
  
  def create
    @invitation = current_user.invitations.new(params[:invitation])
    @channels = current_user.owned_channels.real | Channel.public.local    
    if @invitation.valid?
      @invitation.message = invitation_email(@invitation)
      if @invitation.save
        redirect_to @invitation and return
      end
    end 
    flash[:error] = @invitation.errors.full_messages.to_sentence
    render :action => :new
  end
  
  def update
    @invitation = Invitation.find(params[:id])
    @invitation.update_attributes(params[:invitation])
    if params[:send]
      if @invitation.send_email
        @invitation.update_attribute(:sent_at, Time.now) 
        flash[:notice] = "The invitation was sent."
      end
    end
    redirect_to @invitation
  end
  
  def show
    @invitation = Invitation.find(params[:id])
  end
  
  def devise_mapping 
    @devise_mapping ||= Devise.mappings[:user]
  end
  
  def destroy
    @invitation = Invitation.find(params[:id])
    @invitation.destroy
    redirect_to invitations_path
  end
  
end
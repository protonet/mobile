class InvitationsController < ApplicationController
  
  filter_resource_access
  include InvitationsHelper
  
  before_filter :set_nav
  after_filter :fake_controller_name,  :if => Proc.new { |a| a.request.xhr? }
  def set_nav
    @nav = "invitations"
  end
  
  def fake_controller_name
    response.headers['X-Controller-Name'] = "users"
  end
  
  def index
    @invitations = Invitation.order("created_at DESC")
  end
  
  def new
    @invitee_email = params[:invitee_email]
    default_role = SystemPreferences.privacy["published_to_web"] && SystemPreferences.privacy["published_to_web"]["allow_registrations_for_strangers"] ? 'user' : 'invitee'
    @invitation = current_user.invitations.new(:role => default_role)
    @channels = Channel.real
  end
  
  def create
    @invitation = current_user.invitations.new(params[:invitation])
    @channels = Channel.real - [Channel.system]
    if @invitation.valid?
      @invitation.message = invitation_email(@invitation)
      if @invitation.save
        redirect_to :action => :show, :id => @invitation.id and return
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
        flash[:notice] = t("invitations.flash_message_sent")
        redirect_to :action => :index
      end
    else
      redirect_to :action => :show, :id => @invitation.id
    end
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
    redirect_to :action => :index
  end
  
end
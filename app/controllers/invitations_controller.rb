class InvitationsController < ApplicationController
  layout false
  filter_resource_access
  
  def new
    @invitation = current_user.invitations.new
    @channels = current_user.owned_channels | Channel.public
    
    respond_to do |format|
      format.html
    end
  end
  
  def create
    @invitation = current_user.invitations.new(params[:invitation])
    @channels = current_user.owned_channels | Channel.public
    
    respond_to do |format|
      if @invitation.save
        format.js  { render :json => { :flash => "Invitation was successfully created." }, :status => :created, :content_type => "application/json" }
      else
        format.js  { render :action => :new, :layout => false, :status => :expectation_failed }
      end
    end
  end

end
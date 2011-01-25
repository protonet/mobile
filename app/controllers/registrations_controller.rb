class RegistrationsController < ApplicationController
  prepend_before_filter :require_no_authentication, :only => [ :new, :create ]
  prepend_before_filter :authenticate_scope!, :only => [:edit, :update, :destroy]
  before_filter :check_stranger_setting, :only => [ :new, :create ]

  include Devise::Controllers::InternalHelpers

  # GET /resource/sign_in
  def new
    build_resource
    render_with_scope :new
  end

  # POST /resource/sign_up
  def create
    build_resource

    if resource.valid?
      if session[:invitation_id] && invitation = Invitation.unaccepted.find(session[:invitation_id])
        session[:invitation_id] = nil if resource.accept_invitation(invitation)
      else
        resource.channels = [Channel.home]
      end
      resource.save
      set_flash_message :notice, :signed_up
      sign_in_and_redirect(resource_name, resource)
    else
      render_with_scope :new
    end
  end

  # GET /resource/edit
  def edit
    render_with_scope :edit
  end

  # PUT /resource
  def update
    if self.resource.update_with_password(params[resource_name])
      set_flash_message :notice, :updated
      redirect_to after_sign_in_path_for(self.resource)
    else
      render_with_scope :edit
    end
  end

  # DELETE /resource
  def destroy
    self.resource.destroy
    set_flash_message :notice, :destroyed
    sign_out_and_redirect(self.resource)
  end

  protected

    # Authenticates the current scope and dup the resource
    def authenticate_scope!
      send(:"authenticate_#{resource_name}!")
      self.resource = send(:"current_#{resource_name}").dup
    end
    
    def check_stranger_setting
      session[:invitation_id] = Invitation.unaccepted.find_by_token(params[:token]).try(:id) if params[:token]
      redirect_to "/login" and return unless (!!System::Preferences.allow_registrations_for_strangers || session[:invitation_id])
    end
    
end
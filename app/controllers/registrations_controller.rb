class RegistrationsController < Devise::RegistrationsController
  before_filter :check_stranger_setting, :only => [:new, :create]

  # GET /resource/sign_up
  def new
    @invitation = Invitation.find_by_token(params[:invitation_token])
    attributes = if @invitation
      @invitation.attributes
    else
      {}
    end
    build_resource(attributes)
    render 'devise/registrations/new'
  end
  
  # POST /resource
  def create
    build_resource
    # handle invitations
    @invitation = Invitation.find_by_token(params[:invitation_token])
    resource.invitation_token = params[:invitation_token]
    
    # TODO:
    # Following line somehow causes an exception when the user already exists
    saved = resource.save rescue false
    if saved
      if resource.active_for_authentication?
        set_flash_message :notice, :signed_up
        sign_in_and_redirect(resource_name, resource)
      else
        set_flash_message :notice, :inactive_signed_up, :reason => resource.inactive_message.to_s
        expire_session_data_after_sign_in!
        redirect_to after_inactive_sign_up_path_for(resource)
      end
    else
      clean_up_passwords(resource)
      @signup_error = true
      flash[:error] = "Please check the highlighted fields"
      render 'devise/registrations/new'
    end
  end
  
  protected
  def check_stranger_setting
    unless allow_signup?
      flash[:error] = "The invitation token is invalid." if params[:invitation_token]
      redirect_to new_user_session_path and return 
    end
  end
  
  def build_resource(hash=nil)
    hash ||= params[resource_name] || {}
    custom_user_class = LocalUser
    self.resource = custom_user_class.new_with_session(hash, session)
  end
  
  def is_devise_resource?
    @devise_mapping = Devise.mappings[:user]
  end
  
end
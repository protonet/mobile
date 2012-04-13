class PasswordsController < ApplicationController
  prepend_before_filter :require_no_authentication
  include Devise::Controllers::InternalHelpers
  layout "logged_out"

  # GET /resource/password/new
  def new
    @user = User.new
  end

  # POST /resource/password
  def create
    @user = User.find_for_database_authentication(params[:user])
    if @user
      @user.send(:generate_reset_password_token!)
      Mailer.reset_password_instructions(@user, address_for_current_interface).deliver
      set_flash_message :notice, :send_instructions
      redirect_to new_user_session_path
    else
      flash[:error] = "Could not find a user."
      render :new
    end
  end

  # GET /resource/password/edit?reset_password_token=abcdef
  def edit
    @user = User.new
    @user.reset_password_token = params[:reset_password_token]
    render_with_scope :edit
  end

  # PUT /resource/password
  def update
    @user = User.reset_password_by_token(params[:user])
    if @user.errors.empty?
      set_flash_message :notice, :updated
      sign_in_and_redirect(:user, @user)
    else
      flash[:error] =  @user.errors.to_a.join(" ")
      render_with_scope :edit
    end
  end
end

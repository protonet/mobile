class OmniauthCallbacksController < ApplicationController
  respond_to :json
  
  def facebook
    data = JSON.parse(params[:json])
    @user =   FacebookUser.find_for_facebook_oauth(data, current_user)

    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Facebook"
      sign_in_and_redirect @user, :event => :authentication
    else
      if @user.errors[:email_taken]
        flash[:error] = @user.errors[:email_taken]
      end
      session["devise.facebook_data"] = env["omniauth.auth"]
      redirect_to new_user_registration_url
    end
  end
  
  def twitter
    data = JSON.parse(params[:json])
    @user = TwitterUser.find_for_twitter_oauth(data, current_user)

    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Twitter"
      sign_in_and_redirect @user, :event => :authentication
    else
      if @user.errors[:email_taken]
        flash[:error] = @user.errors[:email_taken]
      end
      session["devise.facebook_data"] = env["omniauth.auth"]
      redirect_to new_user_registration_url
    end
  end
end
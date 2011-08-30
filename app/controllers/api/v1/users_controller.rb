class Api::V1::UsersController < Api::V1::MasterController
  
  before_filter :set_defaults

  # LIST USERS
  def index
    users = if params[:channel_id]
      Channel.find(params[:channel_id]).users rescue []
    else
      User.all
    end
    render :json => users
  end
  
  # CREATE A USER
  def create
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:login].blank? || params[:email].blank?
    
    user = User.new(
      :login => params[:login],
      :name => params[:name],
      :password => (params[:password].blank? ? ActiveSupport::SecureRandom.base64(10) : params[:password]),
      :email => params[:email],
      :external_profile_url => params[:external_profile_url],
      :avatar_url => params[:avatar_url],
      :channels_to_subscribe => (params[:no_channels] == "true" ? [] : nil )
    )
    if user.save
      render :json => {"user_id" => user.id}
    else
      render :json => {:errors => user.errors}, :status => :unprocessable_entity
    end
  end
  
  # use auth_token parameter when logging in via token e.g. http://localhost:3000/?auth_token=tokencomeshere
  def auth_token
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:user_id].blank?
    user = User.find(params[:user_id])
    user.reset_authentication_token!
    render :json => {"token" => user.authentication_token}
  end
  
  # GET A SPECIFIC USER
  def show
    user = User.find(params[:id]) rescue User.find_by_login(params[:id])
    if user
      render :json => user
    else
      head :unprocessable_entity
    end
  end
  
  def destroy
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:id].blank?
    user = User.find(params[:id])
    user.destroy
    user.destroyed? ? head(:ok) : head(:unprocessable_entity)
  end
  
  private
  
  def set_defaults
    @limit = if params[:limit]
      params[:limit] = 500 if params[:limit] > 500
      params[:limit]
    else
      500
    end
  end
    
end

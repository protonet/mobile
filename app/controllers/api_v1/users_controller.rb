class ApiV1::UsersController < ApiV1::MasterController
  
  before_filter :set_defaults

  # LIST USERS
  def index
    if params[:user_id]
      users = User.find(params[:user_id].to_a)
    else
      users = User.all
    end
    render :json => users
  end
  
  # CREATE A USER
  def create
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:login].blank?
    user = User.new(
      :login => params[:login],
      :name => (params[:name] || params[:login]),
      :password => (params[:password] || ActiveSupport::SecureRandom.base64(10)),
      :email => (params[:email] || "#{params[:login]}@user.local"),
      :profile_url => nil,
      :avatar_url => nil
    )
    if user.save
      render :json => {"user_id" => user.id}
    else
      render :json => user.errors, :status => :unprocessable_entity
    end
  end
  
  # use auth_token parameter when logging in via token e.g. http://localhost:3000/?auth_token=tokencomeshere
  def login_token
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:user_id].blank?
    user = User.find(params[:user_id]).reset_authentication_token!
    render :json => {"token" => user.authentication_token}
  end
  
  # GET A SPECIFIC USER
  def show
    render :json => User.find(params[:id])
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

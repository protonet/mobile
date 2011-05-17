class ApiV1::UsersController < ApiV1::MasterController
  
  before_filter :set_defaults
  
  def index
    if params[:user_id]
      users = User.find(params[:user_id].to_a)
    else
      users = User.all
    end
    render :json => users
  end
  
  # CREATE A CHANNEL
  def create
    return if params[:name].blank?
    channel = Channel.new(:name => params[:name], :description => params[:description], :owner => @current_user)
    if channel.save
      render :json => {"channel_id" => channel.id}
    else
      render :json => channel.errors, :status => :unprocessable_entity
    end
  end
  
  # GET A SPECIFIC CHANNEL
  def show
    render :json => Channel.find(params[:id])
  end
  
  # LIST CHANNELS FOR USER
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

class Api::V1::ChannelsController < Api::V1::MasterController
  
  before_filter :set_defaults
  
  # GET A CHANNEL
  # OR ALL YOUR CHANNELS
  def index
    if params[:channel_id]
      channels = Channel.find(params[:channel_id].to_a)
    else
      channels = @current_user.channels.limit(@limit)
    end
    render :json => channels
  end
  
  # CREATE A CHANNEL
  def create
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:name].blank?
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

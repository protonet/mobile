class Api::V1::ChannelsController < Api::V1::MasterController
  
  before_filter :set_defaults
  
  # GET ALL YOUR CHANNELS
  def index
    channels = if params[:global]
      Channel.where(:global => true).all
    else
      @current_user.channels.limit(@limit)
    end
    render :json => channels
  end
  
  # CREATE A CHANNEL
  def create
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:name].blank?
    channel = Channel.new(params.merge(:owner => @current_user))
    if channel.save
      render :json => {"channel_id" => channel.id}
    else
      render :json => {:errors => channel.errors}, :status => :unprocessable_entity
    end
  end
  
  # GET A SPECIFIC CHANNEL
  def show
    channel = Channel.find(params[:id]) rescue Channel.find_by_name(params[:id])
    if channel
      render :json => channel
    else
      head :unprocessable_entity
    end
  end
  
  def destroy
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:id].blank?
    channel = Channel.find(params[:id])
    channel.destroy
    channel.destroyed? ? head(:ok) : head(:unprocessable_entity)
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

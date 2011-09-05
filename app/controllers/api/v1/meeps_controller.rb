class Api::V1::MeepsController < Api::V1::MasterController
  # EVERY CALL AUTHENTICATES A USER
  #
  # http://USERNAME:PASSOWRD@HOST.COM
  #
  # GLOBAL LIMIT = 500
  
  before_filter :set_defaults
  
  
  # GET TIMELINE 
  # LIMIT, OFFSET AUF ID ODER AFTER CREATED_AT
  def index
    if params[:channel_id]
      channels = Channel.find(params[:channel_id].to_a)
    else
      channels = @current_user.channels
    end
    meeps = channels.collect {|c| c.meeps.limit(@limit)}
    render :json => meeps
  end
  
  # CREATE A MEEP/TWEET
  def create
    return if params[:message].blank? || params[:channel_id].blank?
    meep = @current_user.meeps.build({:author => @current_user.display_name, :channel => Channel.find(params[:channel_id]), :message => params[:message]})
    if meep.save
      render :json => {"meep_id" => meep.id}
    else
      render :json => {:errors => meep.errors}, :status => :unprocessable_entity
    end
  end
  
  # GET A SPECIFIC MEEP
  def show
    render :json => Meep.where(:channel_id => @current_user.channels.map(&:id)).find(params[:id])
  end
  
  # LIST CHANNELS FOR USER
  
  # 
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

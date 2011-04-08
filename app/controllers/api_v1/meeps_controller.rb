class ApiV1::MeepsController < ApiV1::MasterController
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
    meeps = channels.collect {|c| c.tweets.limit(@limit)}
    render :json => meeps
  end
  
  # CREATE A MEEP/TWEET
  def create
    return if params[:message].blank? || params[:channel_id].blank?
    channel = Channel.find(params[:channel_id])
    tweet = @current_user.tweets.build({:author => "api", :channels => [channel], :message => params[:message]})
    if tweet.save
      render :json => {"tweet_id" => tweet.id}
    else
      render :json => tweet.errors, :status => :unprocessable_entity
    end
  end
  
  # GET A SPECIFIC MEEP
  def show
    render :json => Tweet.includes(:says).where("says.channel_id" => @current_user.channels.map(&:id)).find(params[:id])
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

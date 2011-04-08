class ApiV1::MeepsController < ApiV1::MasterController
  
  def index
    render :json => {"ali" => 1, "björn" => 2}
  end
  
  def create
    return if params[:message].blank? || params[:channel_id].blank?
    channel = Channel.find(params[:channel_id])
    tweet = Tweet.new({:author => "api", :user => User.anonymous, :channels => [channel], :message => params[:message]})
    if tweet.save
      render :json => {"tweet_id" => tweet.id}
    else
      render :json => tweet.errors, :status => :unprocessable_entity
    end
  end
  
end

class TweetsController < ApplicationController
  
  def index
    channel = Channel.find(:first, :conditions => {:id => params[:channel_id]})
    render :partial => 'tweet_list', :locals => {:tweets => (channel ? channel.tweets.recent : []), :channel => channel || 0}
  end

  def new
  end

  def create
    author = current_user.display_name
    channels = Channel.find(:all, :conditions => ["id in (?)", [params[:message_channel_id]] ])
    # current user is nil when not logged in, that's ok
    @tweet = Tweet.new(params[:tweet].merge({:author => author, :user => current_user, :channels => channels}))
    # saving, nothing else is done here for the moment
    @tweet.save
    respond_to do |format|
      format.js  { render :nothing => true }
      format.html { redirect_to :controller => :instruments, :channel_id => channels.first.id }
    end
    
    # 
  end
  
end
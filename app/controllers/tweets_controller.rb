class TweetsController < ApplicationController
  
  def index
    @no_wrap = true
    channel = Channel.find(:first, :conditions => {:id => params[:channel_id]})
    if    params[:last_id]
      tweets  = (channel ? channel.tweets.all(:conditions => ["tweets.id < ?", params[:last_id]], :order => "tweets.id DESC", :limit => 25) : [])
    elsif params[:first_id]
      tweets  = (channel ? channel.tweets.all(:conditions => ["tweets.id > ?", params[:first_id]], :order => "tweets.id DESC") : [])
    end
    render :partial => 'tweet_list', :locals => {:tweets => tweets, :channel => channel || 0}
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
      format.js  { render :text => @tweet.id }
      format.html { redirect_to :controller => :instruments, :channel_id => channels.first.id }
    end
    
    # 
  end
  
end
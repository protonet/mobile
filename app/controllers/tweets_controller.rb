class TweetsController < ApplicationController
  
  def index
    audience = Audience.find(:first, :conditions => {:id => params[:audience_id]})
    render :partial => 'tweet_list', :locals => {:tweets => (audience ? audience.tweets.recent : []), :audience => audience || 0}
  end

  def new
  end

  def create
    author = current_user.display_name
    # audiences = Audience.find(:all, :conditions => ["id in (?)", params[:audience_ids]])
    audiences = Audience.find(:all, :conditions => ["id in (?)", [params[:message_audience_id]] ])
    # current user is nil when not logged in, that's ok
    @tweet = Tweet.new(params[:tweet].merge({:author => author, :user => current_user, :audiences => audiences}))
    # saving, nothing else is done here for the moment
    @tweet.save
    respond_to do |format|
      format.js  { render :nothing => true }
      format.html { redirect_to :controller => :instruments, :audience_id => audiences.first.id }
    end
    
    # 
  end
  
end
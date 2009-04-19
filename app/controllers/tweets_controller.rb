class TweetsController < ApplicationController
  
  def index
    audience = Audience.find(:first, :conditions => {:id => params[:audience_id]})
    render :partial => 'tweet_list', :locals => {:tweets => (audience ? audience.tweets.recent : [])}
  end

  def new
  end

  def create
    author = current_user.try(:display_name) || logged_out_user.name
    audiences = Audience.find(:all, :conditions => ["id in (?)", params[:audience_ids]])
    # current user is nil when not logged in, that's ok
    @tweet = Tweet.new(params[:tweet].merge({:author => author, :user => current_user, :audiences => audiences}))
    success = @tweet.save
    if success && @tweet.errors.empty?
      flash[:notice] = "Success!"
    else
      flash[:error] = "Failveh!"
    end
    redirect_to :controller => :instruments, :audience_id => audiences.first.id
  end
  
end
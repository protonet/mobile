class TweetsController < ApplicationController

  def new
  end

  def create
    author = current_user && current_user.display_name || User.coward(session[:session_id][0,10]).name
    audiences = Audience.find(:all, :conditions => ["id in (?)", params[:audiences]])
    # current user is nil when not logged in, that's ok
    @tweet = Tweet.new(params[:tweet].merge({:author => author, :user => current_user, :audiences => [Audience.home]}))
    success = @tweet.save
    if success && @tweet.errors.empty?
      flash[:notice] = "Success!"
    else
      flash[:error] = "Failveh!"
    end
    redirect_back_or_default('/')
  end
  
end
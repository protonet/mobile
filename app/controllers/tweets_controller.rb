class TweetsController < ApplicationController

  def new
  end

  def create
    author = current_user.try(:display_name) || logged_out_user.name
    debugger
    audiences = Audience.find(:all, :conditions => ["id in (?)", params[:audience_ids]])
    # current user is nil when not logged in, that's ok
    @tweet = Tweet.new(params[:tweet].merge({:author => author, :user => current_user, :audiences => audiences}))
    success = @tweet.save
    if success && @tweet.errors.empty?
      flash[:notice] = "Success!"
    else
      flash[:error] = "Failveh!"
    end
    redirect_back_or_default('/')
  end
  
end
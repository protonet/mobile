class TweetsController < ApplicationController

  def new
  end

  def create
    @tweet = Tweet.new(params[:tweet].merge({:author => current_user && current_user.display_name || User.coward(session[:session_id][0,10]).name, :user => current_user}))
    success = @tweet.save
    if success && @tweet.errors.empty?
      flash[:notice] = "Success!"
    else
      flash[:error] = "Failveh!"
    end
    redirect_back_or_default('/')
  end
end
class ChannelsController < ApplicationController
  
  # before_filter :login_required
  
  def index
    @channels = Channel.all
  end
  
  def search
    @channels = Channel.all(:conditions => ["description LIKE ?", "%#{params[:description]}%"])
    render :index
  end
  
end

class ChannelsController < ApplicationController
  
  # before_filter :login_required
  
  def index
    @channels = Channel.all
  end
  
  def create
    channel = Channel.new(params[:channel])
    success = channel && channel.save
    if success && channel.errors.empty?
      flash[:notice] = "Successfully created channel '#{params[:channel][:name]}'"
    else
      flash[:error] = "Could not create channel '#{params[:channel][:name]}'"
    end
    redirect_to :action => 'index'
  end
  
  def search
    @channels = Channel.all(:conditions => ["description LIKE ?", "%#{params[:description]}%"])
    render :index
  end
  
end

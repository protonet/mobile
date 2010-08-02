class ListensController < ApplicationController
  include ERB::Util
  
  before_filter :login_required
  
  def index
    redirect_to listen_to_channel_path(:channel_name => params[:channel_name]) if params[:channel_name]
  end
  
  def create
    channel = Channel.find(params[:channel_id])
    
    if channel
      current_user.subscribe(channel)
      flash[:notice] = "you started listening to '#{h(channel.name)}'"
    else
      flash[:error] = "could not subscribe to channel with identifier '#{params[:channel_id].to_s}'"
    end
    
    redirect_to :controller => 'channels', :anchor => channel.try(:id)
  end
  
  def destroy
    listen = Listen.find(params[:id])
    channel = listen.channel
    if listen.user == current_user || channel.owner == current_user
      listen.user.unsubscribe(channel)
      flash[:notice] = "you stopped listening to '#{h(channel.name)}'"
    else
      flash[:notice] = "you have no right to this operation"
    end
    redirect_to :controller => 'channels', :action => 'index', :anchor => channel.id
  end
  
end

class ListensController < ApplicationController
  
  before_filter :login_required
  
  def create
    channel = Channel.find(params[:channel_id])
    if channel
      current_user.subscribe(channel)
      flash[:notice] = "you started listening to #{channel.name}"
    else
      flash[:error] = "could not subscribe to channel with id #{params[:channel_id].to_s}"
    end
    redirect_to :controller => 'channels'
  end
  
  def destroy
    if listen = begin Listen.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        nil
      end
      channel = listen.channel
      listen.destroy
      flash[:notice] = "you stopped listening to #{channel.name}"
    end
    redirect_to :controller => 'channels', :action => 'index'
  end
  
end

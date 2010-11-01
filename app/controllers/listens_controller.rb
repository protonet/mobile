class ListensController < ApplicationController
  include ERB::Util
  
  before_filter :login_required
  
  def index
    redirect_to listen_to_channel_path(:channel_name => params[:channel_name]) if params[:channel_name]
  end
  
  def create
    channel = Channel.find(params[:channel_id]) if params[:channel_id]
    
    if channel
      current_user.subscribe(channel)
      flash[:notice] = "you started listening to #{h(channel.name)}#{' (pending verification)' if !channel.public?}"
    else
      flash[:error] = "could not subscribe to channel with identifier #{h(params[:channel_id].to_s)}"
    end
    
    respond_to do |format|
      format.json { render :json => { :success => true }.to_json }
      format.html { redirect_to :controller => 'channels', :action => 'index', :anchor => channel.try(:id) }
    end
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

  def accept
    listen = Listen.find(params[:listen_id])
    channel = listen.channel
    if current_user == channel.owner
      listen.verified = true
      flash[:notice] = "you allowed user #{listen.user.name} to listen to channel #{channel.name}" if listen.save
    else
      flash[:notice] = "only the channel owner can accept subscription request!"
    end
    redirect_to :controller => 'channels', :action => 'index', :anchor => channel.id
  end

end

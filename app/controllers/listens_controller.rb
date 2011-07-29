class ListensController < ApplicationController
  
  before_filter :set_listen_id
  filter_resource_access
  
  def index
    redirect_to listen_to_channel_path(:channel_name => params[:channel_name]) if params[:channel_name]
  end
  
  def create
    channel = Channel.find(params[:channel_id]) if params[:channel_id]
    
    if channel
      current_user.subscribe(channel)
      flash[:notice] = "you started listening to #{channel.name}#{' (pending verification)' if !channel.public?}"
    else
      flash[:error] = "could not subscribe to channel with identifier #{params[:channel_id].to_s}"
    end
    
    respond_to do |format|
      format.json { render :json => { :success => true, :public_channel => !!channel.try(:public?) }.to_json }
      format.html { redirect_to :controller => 'channels', :action => 'index', :anchor => channel.try(:id) }
    end
  end
  
  def destroy
    listen = Listen.find(params[:id])
    channel = listen.channel
    if listen.user == current_user || channel.owner == current_user
      listen.user.unsubscribe(channel)
      flash[:notice] = "you stopped listening to '#{channel.name}'"
    else
      flash[:notice] = "you have no right to this operation"
    end
    redirect_to :controller => 'channels', :action => 'index', :anchor => channel.id
  end

  def accept
    listen = Listen.find(params[:id])
    channel = listen.channel
    if current_user == channel.owner
      listen.verified = true
      flash[:notice] = "you allowed user #{listen.user.name} to listen to channel #{channel.name}" if listen.save
    else
      flash[:notice] = "only the channel owner can accept subscription request!"
    end
    redirect_to :controller => 'channels', :action => 'index', :anchor => channel.id
  end

  private
  def set_listen_id
    params[:id] = params[:listen_id] if params[:listen_id]
    true
  end


end

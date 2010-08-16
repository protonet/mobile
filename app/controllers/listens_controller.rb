class ListensController < ApplicationController
  include ERB::Util
  
  before_filter :login_required
  
  def index
    redirect_to listen_to_channel_path(:channel_name => params[:channel_name]) if params[:channel_name]
  end
  
  #TODO REFACTOR, too many if elses
  def create
    channel = if params[:channel_id]
      Channel.find(params[:channel_id])
    elsif params[:channel_name]
      Channel.find_by_name(params[:channel_name])
    end
    if channel
      current_user.subscribe(channel)
      flash[:notice] = "you started listening to #{channel.name}#{' (pending verification)' if !channel.public?}"
    else
      flash[:error] = "could not subscribe to channel with identifier #{(params[:channel_name] || params[:channel_id]).to_s}"
    end
    if params[:channel_name] && (channel && !channel.public?)
      redirect_to "/"
    elsif params[:channel_name]
      redirect_to "/#{("#channel_name=" + channel.name if channel.try(:name))}"
    else
      redirect_to :controller => 'channels', :anchor => channel.try(:id)
    end
  end
  
  def destroy
    listen = Listen.find(params[:id])
    channel = listen.channel
    if listen.user == current_user || channel.owner == current_user
      listen.user.unsubscribe(channel)
      flash[:notice] = "you stopped listening to #{channel.name}"
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

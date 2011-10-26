class ListensController < ApplicationController
  
  before_filter :set_listen_id
  filter_resource_access :collection => [:index]
  
  def index
    redirect_to listen_to_channel_path(:channel_name => params[:channel_name]) if params[:channel_name]
  end
  
  def create
    channel = Channel.find(params[:channel_id])
    already_subscribed = current_user.subscribed?(channel)
    current_user.subscribe(channel) unless already_subscribed
    
    respond_to do |format|
      format.html {
        if channel
          flash[:notice] = "You subscribed to @#{channel.name}#{' (pending verification)' if !channel.public?}"
        else
          flash[:error] = already_subscribed ? "You have already subscribed to @#{channel.name}" : "Could not subscribe to channel with identifier '#{params[:channel_id]}'"
        end
        redirect_to_channel(channel)
      }
      format.json {
        render :json => { :success => !!channel, :already_subscribed => already_subscribed, :public_channel => !!channel.try(:public?) }.to_json
      }
    end
  end
  
  def destroy
    listen = Listen.find(params[:id])
    channel = listen.channel
    if listen.user == current_user || channel.owner == current_user || current_user.admin?
      listen.user.unsubscribe(channel)
      if listen.user == current_user
        flash[:notice] = "You successfully unsubscribed from @#{channel.name}"
      else
        flash[:notice] = "@#{listen.user.display_name} has been unsubscribed from @#{channel.name}"
      end
    else
      flash[:error] = "You have no rights to this operation"
    end
    redirect_to_channel(channel)
  end

  def accept
    listen = Listen.find(params[:id])
    channel = listen.channel
    listen.verified = true
    if listen.save
      flash[:notice] = "You allowed user @#{listen.user.display_name} to subscribe to channel @#{channel.name}" if listen.save
      redirect_to_channel(channel)
    else
      head(500)
    end
  end
  
  private
  def set_listen_id
    params[:id] = params[:listen_id] if params[:listen_id]
    true
  end
  
  def redirect_to_channel(channel)
    if channel.locally_hosted?
      redirect_to :controller => 'channels', :action => 'show', :id => channel.id
    else
      redirect_to :controller => 'channels', :action => 'show_global', :uuid => channel.uuid
    end
  end

end

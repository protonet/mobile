class ListensController < ApplicationController
  
  before_filter :set_listen_id
  filter_resource_access :collection => [:index, :global]
  
  def index
    redirect_to listen_to_channel_path(:channel_name => params[:channel_name]) if params[:channel_name]
  end
  
  def create
    channel = Channel.find(params[:channel_id]) if params[:channel_id]
    already_subscribed = current_user.subscribed?(channel)
    current_user.subscribe(channel) if channel && !already_subscribed
    
    respond_to do |format|
      format.html {
        if channel
          flash[:notice] = "You started listening to @#{channel.name}#{' (pending verification)' if !channel.public?}"
        else
          flash[:error] = already_subscribed ? "You are already listening to @#{channel.name}" : "Could not listen to channel with identifier '#{params[:channel_id]}'"
        end
        redirect_to :controller => 'channels', :action => 'show', :id => channel.try(:id)
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
        flash[:notice] = "You stopped listening to @#{channel.name}"
      else
        flash[:notice] = "@#{listen.user.display_name} stopped listening to @#{channel.name}"
      end
    else
      flash[:error] = "You have no rights to this operation"
    end
    redirect_to :controller => 'channels', :action => 'show', :id => channel.id
  end

  def accept
    listen = Listen.find(params[:id])
    channel = listen.channel
    if current_user == channel.owner
      listen.verified = true
      flash[:notice] = "You allowed user @#{listen.user.display_name} to listen to channel @#{channel.name}" if listen.save
    else
      flash[:notice] = "Only the channel owner can verify a listen request!"
    end
    redirect_to :controller => 'channels', :action => 'show', :id => channel.id
  end
  
  def global
    node = Node.couple(params[:node_data])
    if node && channel = node.attach_global_channel(params[:channel_uuid])
      current_user.subscribe(channel)
      redirect_to :root
    else
      render :text => "error"
    end
  end

  
  private
  def set_listen_id
    params[:id] = params[:listen_id] if params[:listen_id]
    true
  end

end

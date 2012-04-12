class ListensController < ApplicationController
  include Rabbit
  
  before_filter :set_listen_id
  filter_resource_access
  
  def index
    redirect_to listen_to_channel_path(:channel_name => params[:channel_name]) if params[:channel_name]
  end
  
  def create
    channel = Channel.find(params[:channel_id])
    current_user.subscribe(channel)
    if channel
      flash[:notice] = "You subscribed to @#{channel.name}#{' (pending verification)' if !channel.public? && !channel.owned_by?(current_user) }"
    else
      flash[:error] = "Could not subscribe to channel with id '#{params[:channel_id]}'"
    end
    redirect_to_channel(channel)
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
    end
    redirect_to_channel(channel)
  end

  def accept
    listen = Listen.find(params[:id])
    channel = listen.channel
    if listen.update_attribute(:verified, true)
      flash[:notice] = "You successfully verified the subscription of @#{listen.user.display_name}"
      redirect_to_channel(channel)
    else
      head(500)
    end
  end
  
  def create_for_user
    if params[:search_term].try(:match, /@.*\./)
      redirect_to(:controller => :invitations, :action => :new, :invitee_email => params[:search_term], :channel_id => params[:channel_id]) and return
    end
    channel = Channel.find(params[:channel_id])
    user = User.find_by_id_or_login(params[:search_term])
    if user
      user.subscribe(channel)
      listen = user.listens.find_by_channel_id(channel.id)
      listen.update_attribute(:verified, true)
      flash[:notice] = "You successfully subscribed @#{listen.user.display_name} to #{channel.name}"
      redirect_to_channel(channel)
    else
      flash[:error] = "Couldn't find user with identifier '#{params[:search_term]}'"
      redirect_to_channel(channel)
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

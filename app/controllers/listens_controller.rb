class ListensController < ApplicationController
  include Rabbit
  
  before_filter :set_listen_id
  filter_resource_access :collection => [:index, :create_for_user]
  
  def index
    redirect_to listen_to_channel_path(:channel_name => params[:channel_name]) if params[:channel_name]
  end
  
  def create
    channel = Channel.find(params[:channel_id])
    current_user.subscribe(channel)
    if channel
      if !channel.public? && !channel.owned_by?(current_user) && !current_user.admin?
        flash[:sticky] = t("listens.flash_message_wait_for_verification", :display_name => channel.owner.display_name)
      else
        flash[:notice] = t("listens.flash_message_created_success", :display_name => channel.display_name)
      end
    else
      flash[:error] = t("listens.flash_message_created_error")
    end
    redirect_to_channel(channel)
  end
  
  def destroy
    listen = Listen.find(params[:id])
    channel = listen.channel
    if listen.user == current_user || channel.owner == current_user || current_user.admin?
      listen.user.unsubscribe(channel)
      if listen.user == current_user
        flash[:notice] = t("listens.flash_message_destroyed_myself_success", :display_name => channel.display_name)
      else
        flash[:notice] = t("listens.flash_message_destroyed_success", :user_display_name => listen.user.display_name, :channel_display_name => channel.display_name)
      end
    end
    redirect_to_channel(channel)
  end

  def accept
    listen = Listen.find(params[:id])
    channel = listen.channel
    if listen.update_attribute(:verified, true)
      flash[:notice] = t("listens.flash_message_verification_success", :display_name => listen.user.display_name)
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
      listen.verified = true
      listen.save(:validate => false)
      flash[:notice] = t("flash_message_create_for_user_success", :user_display_name => listen.user.display_name, :channel_display_name => channel.display_name)
      redirect_to_channel(channel)
    else
      flash[:error] = flash[:notice] = t("flash_message_create_for_user_error", :search_term => params[:search_term])
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

class ChannelsController < ApplicationController
  
  filter_resource_access :collection => [:global, :index, :show_global, :info], :additional_member => [:meeps]
  
  before_filter :couple_node, :only => [:global, :show_global]
  before_filter :available_channels
  
  def index
    @subscribed_channels = current_user.channels.real.order_by_name
    @nav = "channels"
  end
  
  def show
    @nav = "channels"
  end
  
  def global
    @nav = "global"
    @team_node = Node.team
    @global_channels = @team_node.global_channels
  end
  
  def meeps
    if params[:last_id]
      meeps = @channel.meeps.all(:conditions => ["meeps.id < ?", params[:last_id]], :order => "meeps.id DESC", :limit => 25)
    elsif params[:first_id]
      meeps = @channel.meeps.all(:conditions => ["meeps.id > ?", params[:first_id]], :order => "meeps.id DESC", :limit => 100)
    else
      meeps = []
    end
    
    render :json => Meep.prepare_many_for_frontend(meeps, { :channel_id => @channel.id })
  end
  
  def info
    channels = current_user.channels
    channels_to_load = params[:ids].split(',') rescue channels.each {|c| c.id.to_s }
    
    respond_to do |format|
      format.json do
        render :json => channels.map { |channel|
          next unless channels_to_load.include?(channel.id.to_s)
          include_meeps = params[:include_meeps] && current_user.subscribed?(channel)
          Channel.prepare_for_frontend(channel, include_meeps)
        }.compact
      end
    end
  end
  
  def show_global
    @nav = "global"
    @channel = Channel.find(@remote_channel_id)
    render :show
  end
  
  def edit
    @nav = "channels"
  end
  
  def new
    @nav = "new"
  end
  
  def create
    channel = Channel.new(params[:channel].merge(:owner => current_user))
    success = channel && channel.save
    if success && channel.errors.empty?
      flash[:notice] = t("channels.flash_message_channel_created_success", :name => params[:channel][:name])
      redirect_to :action => 'show', :id => channel.id
    else
      flash[:error] = t("channels.flash_message_channel_created_error", :errors => channel.errors.map().join(' '))
      head(412)
    end
  end
  
  def update
    channel = Channel.find(params[:channel][:id])
    success = channel && channel.update_attributes(params[:channel])
    if success && channel.errors.empty?
      flash[:notice] = t("channels.flash_message_channel_updated_success", :display_name => channel.display_name)
    else
      flash[:error] = t("channels.flash_message_channel_updated_error", :display_name => channel.display_name)
    end
    redirect_to :action => 'show', :id => channel.id
  end
  
  def destroy
    success = @channel.destroy
    if success && @channel.errors.empty?
      flash[:notice] = t("channels.flash_message_channel_destroyed_success", :display_name => @channel.display_name)
      redirect_to :action => 'index'
    else
      flash[:error] = t("channels.flash_message_channel_destroyed_error", :display_name => @channel.display_name)
    end
  end
  
  private
    def couple_node
      Node.couple(params[:node]).attach_global_channel(params[:uuid]) rescue nil
      @remote_channel_id = Channel.find_by_uuid(params[:uuid])
      true
    end
    
    def available_channels
      @channels = if current_user.invitee?
        current_user.channels.real.order_by_name
      else
        Channel.real.local.order_by_name
      end
    end
end

class ChannelsController < ApplicationController
  
  filter_resource_access :collection => [:global, :index, :show_global, :info]
  
  before_filter :couple_node, :only => [:global, :show_global]
  before_filter :available_channels
  
  def index
    @subscribed_channels = Channel.real.joins(:listens).where(:listens => {:user_id => current_user.id}).order_by_name
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
  
  def info
    channels = Channel.all
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
  
  def new
    @nav = "new"
  end
  
  def create
    channel = Channel.new(params[:channel].merge(:owner => current_user))
    success = channel && channel.save
    if success && channel.errors.empty?
      flash[:notice] = "Successfully created channel '#{params[:channel][:name]}'"
      redirect_to :action => 'show', :id => channel.id
    else
      flash[:error] = "Could not create channel, #{channel.errors.map().join(' ')}"
      head(412)
    end
  end
  
  def update
    channel = Channel.find(params[:channel][:id])
    success = channel && channel.update_attributes(params[:channel])
    if success && channel.errors.empty?
      flash[:notice] = "Successfully updated channel '#{channel.name}'"
    else
      flash[:error] = "Could not update channel '#{channel.name}'"
    end
    redirect_to :action => 'show', :id => channel.id
  end
  
  def destroy
    channel = Channel.find(params[:id])
    channel_name = channel.name
    success = channel.destroy
    if success && channel.errors.empty?
      flash[:notice] = "Successfully deleted channel '#{channel_name}'"
      redirect_to :action => :index
    else
      flash[:error] = "Could not delete channel '#{channel_name}'"
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

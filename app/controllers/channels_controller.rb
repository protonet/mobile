class ChannelsController < ApplicationController
  
  filter_resource_access :collection => [:index, :list_global, :show_global, :recommended_global_teaser, :list]
  
  before_filter :couple_node, :only => [:show_global, :list_global]
  
  def index
  end
  
  def list
    @selected_channel = Channel.find_by_id(params[:id])
  end
  
  def show
    respond_to do |format|
      format.html do
        if request.headers['X-Request-Type'] == 'tab'
          render :partial => "channel_details", :locals => { :channel => Channel.find(params[:id]) }
        else
          # TODO: This can be used to get the content of any channel #security
          @selected_channel = Channel.find(params[:id])
          render :list
        end
      end
      format.json do
        render :json => Channel.prepare_for_frontend(current_user.channels.find(params[:id]), current_user)
      end
    end
  end
  
  def show_global
    if request.headers['X-Request-Type'] == 'tab'
      render :partial => "channel_details", :locals => { :channel => Channel.find(@remote_channel_id) }
    else
      @selected_channel = Channel.find(@remote_channel_id)
      render :list_global
    end
  end
  
  def list_global
    @selected_channel = Channel.find_by_id(@remote_channel_id)
  end
  
  def new
  end
  
  def create
    channel = Channel.new(params[:channel].merge(:owner => current_user))
    success = channel && channel.save
    if success && channel.errors.empty?
      flash[:notice] = "Successfully created channel '#{params[:channel][:name]}'"
      xhr_redirect_to :action => 'show', :id => channel.id
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
    xhr_redirect_to :action => 'show', :id => channel.id
  end
  
  def destroy
    channel = Channel.find(params[:id])
    channel_name = channel.name
    success = channel.destroy
    if success && channel.errors.empty?
      flash[:notice] = "Successfully deleted channel '#{channel_name}'"
      xhr_redirect_to :action => 'list'
    else
      flash[:error] = "Could not delete channel '#{channel_name}'"
    end
  end
  
  def recommended_global_teaser
    render :partial => 'channels/teaser/recommended_global', :locals => { :node => Node.team }
  end
  
  private
    def couple_node
      Node.couple(params[:node]).attach_global_channel(params[:uuid]) rescue nil
      @remote_channel_id = Channel.find_by_uuid(params[:uuid])
      true
    end
end

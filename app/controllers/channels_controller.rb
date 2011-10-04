class ChannelsController < ApplicationController
  
  filter_resource_access :collection => [:index, :global]
  
  def index
    @selected_channel = Channel.find(params[:id]) rescue nil
  end
  
  def show
    respond_to do |format|
      format.html do
        if request.headers['X-Request-Type'] == 'tab'
          render :partial => "channel_details", :locals => { :channel => Channel.find(params[:id]) }
        else
          @selected_channel = Channel.find(params[:id])
          render :index
        end
      end
      format.json do
        render :json => Channel.prepare_for_frontend(current_user.channels.find(params[:id]), current_user)
      end
    end
  end
  
  def new
  end
  
  def create
    channel = Channel.new(params[:channel].merge(:owner => current_user))
    success = channel && channel.save
    if success && channel.errors.empty?
      flash[:notice] = "Successfully created channel '#{params[:channel][:name]}'"
      redirect_to_and_preserve_xhr :action => 'index', :id => channel.id
    else
      flash[:error] = "Could not create channel, #{channel.errors.map().join(' ')}"
      head(:status => :expectation_failed)
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
    redirect_to_and_preserve_xhr :action => 'index', :id => channel.id
  end
  
  def destroy
    channel = Channel.find(params[:id])
    if channel && (channel.owned_by?(current_user) || current_user.admin?)
      channel_name = channel.name
      success = channel.destroy
      if success && channel.errors.empty?
        flash[:notice] = "Successfully deleted channel '#{channel_name}'"
        redirect_to_and_preserve_xhr :action => 'index'
      else
        flash[:error] = "Could not delete channel '#{channel_name}'"
      end
    end
  end
  
  def global
    protonet = Protolink::Protonet.open("https://team.protonet.info", "node2node", "5fdr42Ng2")
    @channels = protonet.global_channels || []
    
    render :global
  end

  def list
    respond_to do |format|
      format.json do
        channels = Channel.all.collect { |c| {:id => c.id, :name => c.name, :description => c.description, :uuid => c.uuid}}
        render :json => {:channels => channels}
      end
    end
  end
end

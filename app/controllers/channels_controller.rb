class ChannelsController < ApplicationController
  
  # before_filter :login_required
  
  def index
    respond_to do |format|
      format.json do
        network_id  = params[:network_id].to_i
        render :json => network_id == 0 ? {} : Network.find(network_id).channels
      end
      format.html do
        @networks = Network.all
      end
    end
  end
  
  def show
    respond_to do |format|
      format.json do
        render :text => 'json'
      end
      format.html do
        render :partial => "channel_details", :locals => {:channel => Channel.find(params[:id])}
      end
    end
  end
  
  def create
    channel = Channel.new(params[:channel].merge(:owner => current_user))
    success = channel && channel.save
    if success && channel.errors.empty?
      flash[:notice] = "Successfully created channel '#{params[:channel][:name]}'"
    else
      flash[:error] = "Could not create channel '#{params[:channel][:name]}', the reason is: #{channel.errors.map(&:inspect).join(' ')}"
    end
    redirect_to :action => 'index', :anchor => channel.id
  end
  
  def update
    channel = Channel.find(params[:channel][:id])
    success = channel && channel.update_attributes(params[:channel])
    if success && channel.errors.empty?
      flash[:notice] = "Successfully updated channel '#{params[:channel][:name]}'"
    else
      flash[:error] = "Could not update channel '#{params[:channel][:name]}'"
    end
    redirect_to :action => 'index', :anchor => channel.id
  end
  
  def destroy
    channel = Channel.find(params[:id])
    if(channel && channel.owned_by(current_user)) 
      success = channel.destroy
      if success && channel.errors.empty?
        flash[:notice] = "Successfully deleted channel '#{channel.name}'"
      else
        flash[:error] = "Could not delete channel '#{channel.name}'"
      end
    end
    redirect_to :action => 'index'
  end

  def search
    @channels = Channel.all(:conditions => ["description LIKE ?", "%#{params[:description]}%"])
    render :index
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

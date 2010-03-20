class ChannelsController < ApplicationController
  
  # before_filter :login_required
  
  def index
    @channels = Channel.all
  end
  
  def create
    channel = Channel.new(params[:channel])
    success = channel && channel.save
    if success && channel.errors.empty?
      flash[:notice] = "Successfully created channel '#{params[:channel][:name]}'"
    else
      flash[:error] = "Could not create channel '#{params[:channel][:name]}'"
    end
    redirect_to :action => 'index'
  end
  
  def update
    channel = Channel.find(params[:channel][:id])
    success = channel && channel.update_attributes(params[:channel])
    if success && channel.errors.empty?
      flash[:notice] = "Successfully updated channel '#{params[:channel][:name]}'"
    else
      flash[:error] = "Could not update channel '#{params[:channel][:name]}'"
    end
    redirect_to :action => 'index'
  end
  
  def destroy
    channel = Channel.find(params[:id])
    success = channel && channel.destroy
    if success && channel.errors.empty?
      flash[:notice] = "Successfully deleted channel '#{channel.name}'"
    else
      flash[:error] = "Could not delete channel '#{channel.name}'"
    end
    redirect_to :action => 'index'
  end

  def list
    # TODO: using the token this way is ... well insecure?
    user = User.find_by_communication_token params[:token]

    respond_to do |format|
      format.json do
        if user
          channels = user.channels.collect { |c| {:id => c.id, :name => c.name, :description => c.description}}
          render :json => {:channels => channels.to_json}
        else
          # TODO: remove hardcoded channel info, does it make sense to use Channel.find :first? what if it gets deleted later?
          render :json => {:channels => [{:id => 1, :name => 'home', :description => 'your homebase'}]}
        end
      end
    end
  end
  
  def search
    @channels = Channel.all(:conditions => ["description LIKE ?", "%#{params[:description]}%"])
    render :index
  end
  
end

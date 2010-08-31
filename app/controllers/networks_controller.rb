class NetworksController < ApplicationController
  #TODO: this needs some sort of per node authentication
  # otherwise nodes may send leave messages for other nodes

  # before_filter :login_required

  def index
    @networks = Network.all
  end
  
  def show
    render :text => Network.find(params[:id]).attributes.to_a.join("<br>")
  end
  
  def create
    network = Network.new(params[:network])
    if network.save && network.errors.empty?
      flash[:notice] = "Successfully added network '#{params[:network][:name]}'"
    else
      flash[:error] = "Could not add network '#{params[:network][:name]}', the reason is: #{network.errors.map(&:inspect).join(' ')}"
    end
    redirect_to :action => 'index', :anchor => network.id
  end
  
  def map
    network = Network.first
    nodes = Node.all.collect{|n| {:name => n.name, :type => n.type}}
    render :json => {
      :nodes => nodes + [:name => network.name, :type => 'supernode']
    }
  end
  
  # internally available
  def couple
    network = Network.find(params[:network_id])
    head (network.couple ? :ok : :error)
  end
  
  def decouple
    network = Network.find(params[:network_id])
    head (network.decouple ? :ok : :error)
  end

  # externally available
  def channels
    render :json => {:channels => Channel.global.all}
  end

  def join
    # clients must send a keepalive join otherwise we drop the connection
    # question if we store the nodes domain name does it mean a dns lookup which
    # could potentially lockup the rails application?
    key = ActiveSupport::SecureRandom.base64(10)
    # Node.new(:name => request.remote_ip, :type => 'edge', :key => key).save
    render :json => {:channels => Channel.global.all, :key => key}
  end

  def leave
    node = Node.find_by_name request.remote_ip
    node.delete if node
    head :ok
  end
end

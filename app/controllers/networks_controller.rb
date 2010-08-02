class NetworksController < ApplicationController
  #TODO: this needs some sort of per node authentication
  # otherwise nodes may send leave messages for other nodes

  # before_filter :login_required

  def index
    @networks = Network.all
  end
  
  def create
    network = Network.new(params[:network])
    if network.save && network.errors.empty?
      flash[:notice] = "Successfully created network '#{params[:network][:name]}'"
    else
      flash[:error] = "Could not create network '#{params[:network][:name]}', the reason is: #{network.errors.map(&:inspect).join(' ')}"
    end
    redirect_to :action => 'index', :anchor => network.id
  end

  def map
    network = Network.first(params[:network_id])
    nodes = Node.all.collect{|n| {:name => n.name, :type => n.type}}
    render :json => {
      :nodes => nodes + [:name => network.name, :type => 'supernode']
    }
  end

  def join
    # clients must send a keepalive join otherwise we drop the connection
    # question if we store the nodes domain name does it mean a dns lookup which
    # could potentially lockup the rails application?
    Node.new(:name => request.remote_ip, :type => 'edge').save
    head :ok
  end

  def leave
    node = Node.find_by_name request.remote_ip
    node.delete if node
    head :ok
  end

  def connect
    network = Network.first
    Net::HTTP.get_print network.supernode, '/networks/join'
    redirect_to networks_url
  end
end

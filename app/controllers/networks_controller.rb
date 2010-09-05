class NetworksController < ApplicationController
  #TODO: this needs some sort of per node authentication
  # otherwise nodes may send leave messages for other nodes

  # before_filter :login_required
  protect_from_forgery :except => :negotiate
  
  class InvalidKeyError < Exception; end # used in negotiate

  def index
    @networks = Network.all
  end
  
  def show
    render :text => Network.find(params[:id]).attributes.to_a.join("<br/>")
  end
  
  # TODO: I don't think this is used anymore. Could be saved as non-JS backup?
  def create
    network = Network.new(params[:network])
    if network.save && network.errors.empty?
      flash[:notice] = "Successfully added network '#{params[:network][:name]}'"
    else
      flash[:error] = "Could not add network '#{params[:network][:name]}', the reason is: #{network.errors.map(&:inspect).join(' ')}"
    end
    redirect_to :action => 'index', :anchor => network.id
  end
  
  # TODO: More detail pl0z
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
  def negotiate
    res = {
      :node => Network.find(1),
      :config => {
        :socket_server_host => request.env["SERVER_NAME"],
        :socket_server_port => configatron.socket.port,
        :server => request.env["SERVER_SOFTWARE"] && request.env["SERVER_SOFTWARE"].match(/^\w*/)[0]
      },
      :channels => {}
    }
    
    # Populate a simpler form of each channel
    chans = {}
    Channel.global.each do |chan|
      res[:channels][chan.uuid] = {:name => chan.name, :description => chan.description}
    end
    
    # Handle creating a local node
    if request.post?
      node = Network.find_by_uuid params[:network][:uuid]
      if !node
        node = Network.new params[:network]
        res[:result] = 'created'
      elsif !node.key || node.key == params[:key]
        node.attributes = params[:network] # like update_attributes but doesn't save
        res[:result] = 'updated'
      else
        raise InvalidKeyError
      end
      
      # Give the node a random key (for the socket server handshake)
      res[:key] = node.generate_key
      node.save
    end
    
    render :json => res
  rescue InvalidKeyError
    render :json => {:result => 'invalid key'}
  end
end

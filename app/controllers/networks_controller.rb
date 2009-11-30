class NetworksController < ApplicationController
  
  # before_filter :login_required
  
  def index
    @networks = Network.all
  end
  
  def map
    network = Network.first(params[:network_id])
    render :json => {:nodes => [
      {:name => "protonet-7.local", :type => 'edge', :clients => [{:name => 'foo'}, {:name => 'bar'}]},
      {:name => "protonet-4.local", :type => 'edge'},
      {:name => "protonet-main",    :type => 'supernode'}
    ], :name => network.name, :type => 'cloud'}
  end
  
end

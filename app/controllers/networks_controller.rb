class NetworksController < ApplicationController
  
  # before_filter :login_required
  
  def index
    @networks = Network.all
  end
  
end

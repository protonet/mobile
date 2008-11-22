class Assets < Application

  # ...and remember, everything returned from an action
  # goes to the client...
  def index
    render
  end
  
  def create
    Merb.logger.info(params[:file].inspect)
    Asset.new(params[:file]).save
    render 'done'
  end
  
end

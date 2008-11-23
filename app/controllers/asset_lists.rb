class AssetLists < Application

  # ...and remember, everything returned from an action
  # goes to the client...
  def index
    render 'foo'
  end
  
  def create
    @list = AssetList.new(:name => params[:name])
    if @list.save
      redirect url(:action => :show, :id => @list.id)
    else
      redirect url(:home)
    end
  end
  
  def update
    # not implemented
  end
  
  def show
    @list = AssetList.get(params[:id].to_i)
    render
  end
  
  
end

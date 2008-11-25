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
    @list = AssetList.get(params[:id])
    if asset_ids = params[:asset_list].delete(:assets)
      @list.assets += Asset.all(:id => asset_ids)
      @list.save
    end
    @list.update_attributes(params[:asset_list])
    redirect url(:action => :show, :id => @list.id)
  end
  
  def show
    @list = AssetList.get(params[:id].to_i)
    render
  end

  def edit
    @list = AssetList.get(params[:id].to_i)
    render
  end
  
end

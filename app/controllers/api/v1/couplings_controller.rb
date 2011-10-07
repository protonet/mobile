class Api::V1::CouplingsController < Api::V1::MasterController
  
  skip_before_filter :authenticate, :only => [:create, :show]
  
  # CREATE A COUPLING
  def create
    # return head :unprocessable_entity if params[:message].blank? || params[:channel_id].blank?
    node = Node.find_or_create_by_uuid(params[:node_data][:uuid], params[:node_data])
    user, password = node.generate_user
    if user
      render :json => [user, password]
    else
      render :json => {:errors => user.errors}, :status => :unprocessable_entity
    end
  end
  
  # CHECK A COUPLING
  def show
    node = Node.find(params[:id])
    if node
      render :json => node
    else
      render :status => :unprocessable_entity
    end
  end
  
end

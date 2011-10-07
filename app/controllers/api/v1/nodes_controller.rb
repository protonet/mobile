class Api::V1::NodesController < Api::V1::MasterController
  
  skip_before_filter :authenticate, :only => [:show]
  
  # NODE DATA
  def show
    return head :unprocessable_entity unless params[:id].to_s == "1"
    render :json => Node.find(1)
  end
  
end

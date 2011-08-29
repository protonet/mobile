class Api::V1::RendezvousController < Api::V1::MasterController
  
  before_filter :set_defaults
  
  # 
  def index
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:first_user_id].blank? || params[:second_user_id].blank?
    channel = Channel.find_by_rendezvous(Channel.rendezvous_key(params[:first_user_id], params[:second_user_id])) # rescue nil
    if channel
      render :json => channel
    else
      head :not_found
    end
  end
  
  # CREATE A RENDEZVOUS CHANNEL
  def create
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:first_user_id].blank? || params[:second_user_id].blank?
    if channel = Channel.setup_rendezvous_for(params[:first_user_id], params[:second_user_id])
      render :json => channel
    else
      render :json => channel.errors, :status => :unprocessable_entity
    end
  end
  
  # 
  def show
    head :not_found
  end
  
  def destroy
    head :not_found
  end
  
  private
  
  def set_defaults
    @limit = if params[:limit]
      params[:limit] = 500 if params[:limit] > 500
      params[:limit]
    else
      500
    end
  end
    
end

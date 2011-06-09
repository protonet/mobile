class ApiV1::ListensController < ApiV1::MasterController
  def create
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:user_id].blank? || params[:channel_id].blank?
    begin
      if User.find(params[:user_id]).subscribe(Channel.find(channel_id))
        head :ok
      else
        head :unprocessable_entity
      end
    rescue
      head :unprocessable_entity
    end
  end
  
  def destroy
    return head :unprocessable_entity unless @current_user.admin?
    return head :unprocessable_entity if params[:user_id].blank? || params[:channel_id].blank?
    begin
      if User.find(params[:user_id]).unsubscribe(Channel.find(channel_id))
        head :ok
      else
        head :unprocessable_entity
      end
    rescue
      head :unprocessable_entity
    end
  end
end
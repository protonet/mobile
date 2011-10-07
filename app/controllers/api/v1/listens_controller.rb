class Api::V1::ListensController < Api::V1::MasterController

  def create
    return head :unprocessable_entity unless @current_user.admin?
    begin
      channel = params[:channel_id] ? Channel.find(params[:channel_id]) : Channel.find_by_uuid([:channel_uuid])
      if User.find(params[:user_id]).subscribe(channel)
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
    begin
      channel = params[:channel_id] ? Channel.find(params[:channel_id]) : Channel.find_by_uuid([:channel_uuid])
      if User.find(params[:user_id]).unsubscribe(channel)
        head :ok
      else
        head :unprocessable_entity
      end
    rescue
      head :unprocessable_entity
    end
  end
end
class Api::V1::ListensController < Api::V1::MasterController

  def create
    begin
      channel = params[:channel_id] ? Channel.find(params[:channel_id]) : Channel.find_by_uuid([:channel_uuid])
      unless @current_user.admin? || @current_user.roles.include?(Role.find_by_title("api-node")) && channel.global
        return head :unprocessable_entity
      end
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
    begin
      channel = params[:channel_id] ? Channel.find(params[:channel_id]) : Channel.find_by_uuid([:channel_uuid])
      unless @current_user.admin? || @current_user.roles.include?(Role.find_by_title("api-node")) && channel.global
        return head :unprocessable_entity
      end
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
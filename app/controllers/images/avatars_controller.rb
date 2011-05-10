class Images::AvatarsController < ApplicationController
  
  def create
    current_user.avatar = params[:avatar_file]
    if current_user.save
      redirect_to preferences_path
    else
      flash[:notice] = "Your photo did not pass validation! #{current_user.errors.full_messages.to_sentence}"
      redirect_to :back
    end
  end
  
end

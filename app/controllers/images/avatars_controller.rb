class Images::AvatarsController < ApplicationController
  
  def create
    avatar = params[:avatar_file]
    avatar.original_filename = Digest::MD5.hexdigest(avatar.original_filename)
    current_user.avatar = avatar
    if current_user.save
      redirect_to preferences_path
    else
      flash[:notice] = "Your photo did not pass validation! #{current_user.errors.full_messages.to_sentence}"
      redirect_to :back
    end
  end
  
end

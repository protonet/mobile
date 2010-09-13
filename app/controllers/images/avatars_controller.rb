class Images::AvatarsController < ApplicationController
  caches_page :show
  
  def show
    @avatar = Images::Avatar.find_by_id(params[:id])
    
    respond_to do |format|
      format.jpg
    end
  end

  def new
    @avatar = Images::Avatar.new
  end

  def create
    @avatar = Images::Avatar.find_by_user_id(current_user.id) || Images::Avatar.new
    @avatar.update_attributes(params[:images_avatar])
    @avatar.user = current_user
    if @avatar.save
      expire_action images_avatar_path(@avatar.id)
      redirect_to preferences_path
    else
      flash[:notice] = 'Your photo did not pass validation!'
      render :new
    end
  end
end

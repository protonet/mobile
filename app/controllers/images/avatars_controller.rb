class Images::AvatarsController < ApplicationController
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
    @avatar = Images::Avatar.new(params[:images_avatar])
    @avatar.user = current_user
    if @avatar.save
      redirect_to user_path(current_user)
    else
      flash[:notice] = 'Your photo did not pass validation!'
      render :new
    end
  end
end

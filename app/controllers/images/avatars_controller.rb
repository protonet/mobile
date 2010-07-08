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
  
  def update
    @avatar = Images::Avatar.find_by_user_id(current_user.id)
    if @avatar.update_attributes(params[:images_avatar])
      redirect_to preferences_path
    else
      flash[:notice] = 'Your photo did not pass validation!'
      render :new
    end
  end
  
  def create
    # This is absolutely not RESTful, jelveh pls show me how to do this
    return update if Images::Avatar.find_by_user_id(current_user.id)
    
    @avatar = Images::Avatar.new(params[:images_avatar])
    @avatar.user = current_user
    if @avatar.save
      redirect_to preferences_path
    else
      flash[:notice] = 'Your photo did not pass validation!'
      render :new
    end
  end
end

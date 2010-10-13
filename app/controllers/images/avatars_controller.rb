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
    @avatar = Images::Avatar.find_by_user_id(current_user.id) || Images::Avatar.new(:user => current_user)
    @avatar.image_file = params[:images_avatar][:image_file]
    if @avatar.save
      FileUtils.rm("#{RAILS_ROOT}/public/images/avatars/#{@avatar.id}.html") rescue Errno::ENOENT
      redirect_to preferences_path
    else
      flash[:notice] = 'Your photo did not pass validation!'
      render :new
    end
  end
end

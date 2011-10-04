class Images::AvatarsController < ApplicationController
  include Rabbit
  
  def create
    avatar = params[:avatar_file]
    avatar.original_filename = Digest::MD5.hexdigest(avatar.original_filename)
    user = User.find(params[:user_id])
    
    if current_user.can_edit?(user) && (user.avatar = avatar) && user.save
      render :text => { :success => true }.to_json
      publish "system", "users", {
        :trigger    => "user.changed_avatar",
        :user_id    => user.id,
        :avatar     => user.avatar.url
      }
    else
      render :text => { :error => "Your photo did not pass validation! #{current_user.errors.full_messages.to_sentence}" }.to_json
    end
  end
end

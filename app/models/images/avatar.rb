class Images::Avatar < ActiveRecord::Base
  set_table_name :images_avatars
  
  acts_as_fleximage do 
    image_directory configatron.images.avatars_path
    default_image_path 'public/img/user_picture.png'
  end
  
  belongs_to :user
end

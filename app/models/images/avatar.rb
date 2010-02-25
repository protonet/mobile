class Images::Avatar < ActiveRecord::Base
  set_table_name :images_avatars  
  
  acts_as_fleximage do 
    image_directory configatron.images.avatars_path
    default_image_path 'public/images/userpicture.jpg'
  end
  
  belongs_to :user
end

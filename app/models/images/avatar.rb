class Images::Avatar < ActiveRecord::Base
  set_table_name :images_avatars
  
  acts_as_fleximage :image_directory => 'public/avatars'
end

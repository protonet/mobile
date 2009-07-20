class Images::Avatar < ActiveRecord::Base
  acts_as_fleximage :image_directory => 'public/avatars'
  set_table_name :images_avatars  
  
  belongs_to :user
end

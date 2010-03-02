class Images::External < ActiveRecord::Base
  set_table_name :images_externals
  
  acts_as_fleximage do 
    image_directory configatron.images.externals_path
  end
  
  def self.find_or_create_by_image_url(url)
    find_by_image_url(url) || begin
      image = new({:image_file_url => url, :image_url => url}) # image file url is used by fleximage
      image.save
      image
    end
  end
  
  def self.is_available(url)
    !!find_by_image_url(url)
  end
  
end

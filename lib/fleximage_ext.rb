# faking user agent in fleximage
module Fleximage::Model::InstanceMethods
  def image_file_url=(file_url)
    puts 'foo'
    @image_file_url = file_url
    if file_url =~ %r{^(https?|ftp)://}
      file = open(file_url, {"User-Agent" => "Mozilla/5.0"})
      
      # Force a URL based file to have an original_filename
      eval <<-CODE
        def file.original_filename
          "#{file_url}"
        end
      CODE
      
      self.image_file = file
      
    elsif file_url.empty?
      # Nothing to process, move along
      
    else
      # invalid URL, raise invalid image validation error
      @invalid_image = true
    end
  end
  
end
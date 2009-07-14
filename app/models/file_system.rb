class FileSystem
  
  def self.all(directory = uploads_path)
    bar = {}
    Dir.chdir(uploads_path) do
      foo = Dir.glob("*")
      foo.each do |entry|
        bar[entry] = File.ftype(entry)
      end
    end
    bar
  end
  
  def self.uploads_path
    # @uploads_path ||= RAILS_ROOT + "/public/uploads_alpha"
    @uploads_path ||= RAILS_ROOT + "/public"
  end
  
end
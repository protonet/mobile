class FileSystem
  
  def self.all(directory = '')
    bar = {}
    Dir.chdir(cleared_path(directory)) do
      foo = Dir.glob("*")
      foo.each do |entry|
        bar[entry] = File.ftype(entry)
      end
    end
    bar
  end
  
  def self.cleared_path(path)
    public_path + '/' + path.to_s
  end
  
  def self.public_path
    @uploads_path ||= RAILS_ROOT + "/public"
  end
  
end
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
  
  # pass path with a leading slash: /foobar not foobar
  def self.cleared_path(path)
    # todo aj: test cleaning of paths
    path.gsub!(/\.\./, '') if path
    public_path + path.to_s
  end
  
  def self.public_path
    @uploads_path ||= RAILS_ROOT + (Rails.env.production? ? "/../../shared/user-files" : "/../shared/user-files")
  end
  
end
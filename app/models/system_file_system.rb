class SystemFileSystem

  def self.all(directory = '')
    files = {}
    Dir.chdir(cleared_path(directory)) do
      target_dir = Dir.glob("*")
      target_dir.each do |entry|
        file_type = File.ftype(entry)
        # incorrect, only works on linked directories not linked files
        file_type = "directory" if file_type == 'link'
        files[file_type] ||= []
        files[file_type].push(entry)
      end
    end
    # sort alphabetically since not all systems return fs entries in the correct order
    files.each do |type, array|
      files[type] = array.sort_alphabetical
    end
    files
  end

  # TODO clear path names <b>BLA</b> potentially hackable!
  # pass path with a leading slash: /foobar not foobar
  def self.cleared_path(path)
    # todo aj: test cleaning of paths
    path.gsub!(/\.\./, '') if path
    public_path.to_s + path
  end

  def self.public_path
    @uploads_path ||= configatron.user_file_path
  end

end
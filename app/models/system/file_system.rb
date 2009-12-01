module System
  class FileSystem

    def self.all(directory = '')
      files = {}
      Dir.chdir(cleared_path(directory)) do
        target_dir = Dir.glob("*")
        target_dir.each do |entry|
          files[File.ftype(entry)] ||= []
          files[File.ftype(entry)].push(entry)
        end
      end
      # sort alphabetically since not all systems return fs entries in the correct order
      # TODO: aj: also doesn't correctly sort umlaute a ä A becomes a A ä
      files.each do |type, array|
        files[type] = array.sort! {|a,b| a.downcase <=> b.downcase}
      end
      files
    end

    # TODO clear path names <b>BLA</b> potentially hackable!
    # pass path with a leading slash: /foobar not foobar
    def self.cleared_path(path)
      # todo aj: test cleaning of paths
      path.gsub!(/\.\./, '') if path
      public_path + path.to_s
    end

    def self.public_path
      @uploads_path ||= configatron.user_file_path
    end

  end  
end
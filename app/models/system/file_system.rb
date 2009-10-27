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
      @uploads_path ||= (Rails.env.production? ? "/home/protonet/dashboard/shared/user-files" : RAILS_ROOT + "/../shared/user-files")
    end

  end  
end
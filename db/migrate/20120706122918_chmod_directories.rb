class ChmodDirectories < ActiveRecord::Migration
  def self.up
    FileUtils.cd configatron.files_path do
      folders = Dir.glob("users/**/") + Dir.glob("channels/**/")
      folders.each do |folder|
        FileUtils.chmod 0770, folder
      end
    end
  end

  def self.down
  end
end

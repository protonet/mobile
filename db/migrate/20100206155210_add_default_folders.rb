class AddDefaultFolders < ActiveRecord::Migration
  def self.up
    user_files_path = RAILS_ROOT + "/../shared/user-files"
    FileUtils.mkdir_p(user_files_path)
    FileUtils.mkdir_p(user_files_path + "/Movies")
    FileUtils.mkdir_p(user_files_path + "/TV Series")
    FileUtils.mkdir_p(user_files_path + "/Music")
    FileUtils.mkdir_p(user_files_path + "/Pictures")
    FileUtils.mkdir_p(user_files_path + "/Documents")
  end

  def self.down
    
  end
end

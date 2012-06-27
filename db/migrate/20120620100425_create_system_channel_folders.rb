class CreateSystemChannelFolders < ActiveRecord::Migration
  
  def self.up
    `mkdir -p #{configatron.files_path}/system_users`
    `chmod g+s #{configatron.files_path}/channels`
    `chmod g+s #{configatron.files_path}/users`
    `chmod g+s #{configatron.files_path}/system_users`
    User.build_system_users 
    User.refresh_system_users
  end
  
  def self.down
    # nope 
  end
end




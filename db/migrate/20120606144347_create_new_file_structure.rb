require "xattr"

class CreateNewFileStructure < ActiveRecord::Migration
  def self.up
    mode           = 0770
    new_files_path = configatron.files_path
    old_files_path = new_files_path.sub(/\/files$/, "/user-files")
    channels_path  = "#{new_files_path}/channels"
    users_path     = "#{new_files_path}/users"
    
    FileUtils.mkdir_p(new_files_path, :mode => mode)
    FileUtils.mkdir_p(channels_path, :mode => mode)
    FileUtils.mkdir_p(users_path, :mode => mode)
    
    User.registered.all.each do |user|
      next if user.system?
      
      user_path = "#{users_path}/#{user.id}"
      FileUtils.mkdir_p(user_path, :mode => mode)
    end
    
    Channel.all.each do |channel|
      next if channel.global?
      
      new_channel_path = "#{channels_path}/#{channel.id}"
      old_channel_path = "#{old_files_path}/#{channel.id}"
      
      if File.exist?(old_channel_path)
        FileUtils.cp_r(old_channel_path, channels_path)
        FileUtils.chmod(mode, new_channel_path)
      else
        FileUtils.mkdir_p(channel_path, :mode => mode)
      end
      
      xattr = Xattr.new(new_channel_path)
      xattr.set("uuid", channel.uuid)
    end
    
    FileUtils.rm_rf(old_files_path)
  end

  def self.down
    old_files_path = configatron.files_path
    new_files_path = old_files_path.sub(/\/files$/, "/user-files")
    old_channels_path = "#{old_files_path}/channels"
    new_channels_path = new_files_path
    
    FileUtils.mkdir_p(new_files_path)
    
    Channel.all.each do |channel|
      next if channel.global?
      
      old_channel_path = "#{old_channels_path}/#{channel.id}"
      
      if File.exist?(old_channel_path)
        FileUtils.cp_r(old_channel_path, new_channels_path)
      end
    end
    
    FileUtils.rm_rf(old_files_path)
  end
end

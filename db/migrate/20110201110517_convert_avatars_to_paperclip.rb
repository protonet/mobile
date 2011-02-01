class ConvertAvatarsToPaperclip < ActiveRecord::Migration
  def self.up
    
    User.all.each do |user|
      next unless user.fleximage_avatar
      user.fleximage_avatar.operate do |image|
        File.open(image.image.filename) do |io|
          user.avatar = io
          user.save
        end
      end
    end
    
  end

  def self.down
  end
end

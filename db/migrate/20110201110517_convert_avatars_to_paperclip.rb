class ConvertAvatarsToPaperclip < ActiveRecord::Migration
  def self.up
    # keep it low-level, so we can remove the old code
    res = ActiveRecord::Base.connection.execute("SELECT * FROM images_avatars")
    res.each_hash do |data|
      if user = User.find(data["user_id"])
        d = Date.parse(data["created_at"])
        files = Dir.glob("#{Rails.root}/#{configatron.images.avatars_path}/#{d.year}/#{d.month}/#{d.day}/#{data["user_id"]}.*")
        File.open(files.first) do |io|
          user.avatar = io
          user.save
        end
      end
    end
  end

  def self.down
  end
end

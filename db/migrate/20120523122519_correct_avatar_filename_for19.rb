class CorrectAvatarFilenameFor19 < ActiveRecord::Migration
  def self.up
    User.registered.all.collect {|u| u if !u.avatar.exists? }.compact.each do |user|
      base_path         = "/home/protonet/dashboard/current/public"
      wrong_filename    = base_path + user.avatar.url(nil, false) + "."
      correct_filename  = base_path + user.avatar.url(nil, false)
      FileUtils.mv(wrong_filename, correct_filename, :force => true) if File.exists?(wrong_filename)
    end
  end

  def self.down
    # nyet
  end
end

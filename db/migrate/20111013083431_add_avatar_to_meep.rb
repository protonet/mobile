class AddAvatarToMeep < ActiveRecord::Migration
  def self.up
    add_column :meeps, :avatar, :string
    ActiveRecord::Base.connection.execute('update meeps, users set meeps.avatar = CONCAT("/system/avatars/", users.id, "/original/", users.avatar_file_name, IF((SELECT users.avatar_file_name REGEXP ".*\\.") = 1, "", ".")) where meeps.user_id = users.id')
    ActiveRecord::Base.connection.execute("UPDATE meeps SET meeps.avatar = '/img/user_picture_r3.png' WHERE avatar IS NULL")
  end

  def self.down
    remove_column :meeps, :avatar
  end
end
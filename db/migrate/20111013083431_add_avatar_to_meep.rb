class AddAvatarToMeep < ActiveRecord::Migration
  def self.up
    add_column :meeps, :avatar, :string
    ActiveRecord::Base.connection.execute('update meeps, users set meeps.avatar = CONCAT("/system/avatars/", users.id, "/original/", users.avatar_file_name, ".") where meeps.user_id = users.id')
  end

  def self.down
    remove_column :meeps, :avatar
  end
end
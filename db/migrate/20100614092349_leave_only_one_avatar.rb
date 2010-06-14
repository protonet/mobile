class LeaveOnlyOneAvatar < ActiveRecord::Migration
  def self.up
    ActiveRecord::Base.connection.execute('delete from images_avatars where id not in (select id from images_avatars group by user_id)')
  end

  def self.down
    # irreversible
  end
end

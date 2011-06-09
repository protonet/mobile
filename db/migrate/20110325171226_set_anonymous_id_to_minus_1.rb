class SetAnonymousIdToMinus1 < ActiveRecord::Migration
  def self.up
    ActiveRecord::Base.connection.execute("update users set id = -1 where id = 0")
    Tweet.update_all("user_id = -1", "user_id = 0")
    Channel.update_all("owner_id = -1", "owner_id = 0")
    Listen.update_all("user_id = -1", "user_id = 0")
  end

  def self.down
    ActiveRecord::Base.connection.execute("update users set id = 0 where id = -1")
    Tweet.update_all("user_id = 0", "user_id = -1")
    Channel.update_all("owner_id = 0", "owner_id = -1")
    Listen.update_all("user_id = 0", "user_id = -1")
  end
end

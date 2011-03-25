class SetAnonymousIdToMinus1 < ActiveRecord::Migration
  def self.up
    ActiveRecord::Base.connection.execute("update users set id = -1 where id = 0")
  end

  def self.down
    ActiveRecord::Base.connection.execute("update users set id = 0 where id = -1")
  end
end

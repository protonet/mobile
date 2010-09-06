class MoveSqliteDatabaseToWal < ActiveRecord::Migration
  def self.up
    result = ActiveRecord::Base.connection.execute('PRAGMA journal_mode = wal')
    raise RuntimeError if RAILS_ENV == "production" && result[0][0] != 'wal'
  end

  def self.down
    ActiveRecord::Base.connection.execute('PRAGMA journal_mode = delete')
  end
end

class MoveSaysToMeepId < ActiveRecord::Migration
  def self.up
    rename_column :says, :tweet_id, :meep_id
  end

  def self.down
    rename_column :says, :meep_id, :tweet_id
  end
end
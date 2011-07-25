class MoveTweetsToMeeps < ActiveRecord::Migration
  def self.up
    rename_table :tweets, :meeps
  end

  def self.down
    rename_table :meeps, :tweets
  end
end
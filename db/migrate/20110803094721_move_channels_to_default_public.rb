class MoveChannelsToDefaultPublic < ActiveRecord::Migration
  def self.up
    change_column_default :channels, :public, true
  end

  def self.down
    change_column_default :channels, :public, false
  end
end
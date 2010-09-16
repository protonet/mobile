class DropAssets < ActiveRecord::Migration
  def self.up
    drop_table :assets
  end

  def self.down
    # irreversible
  end
end

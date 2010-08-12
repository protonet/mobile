class AddVerifiedFlagToListens < ActiveRecord::Migration
  def self.up
    add_column :listens, :verified, :boolean, :default => true
  end

  def self.down
    remove_column :listens, :verified
  end
end

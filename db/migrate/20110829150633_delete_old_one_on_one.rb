class DeleteOldOneOnOne < ActiveRecord::Migration
  def self.up
    Channel.delete_all("display_name != '%_%'")
  end

  def self.down
    # irreversible
  end
end

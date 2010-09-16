class RemoveIntegerFromListens < ActiveRecord::Migration
  def self.up
    remove_column :listens, :integer
  end

  def self.down
    # no down needed
  end
end

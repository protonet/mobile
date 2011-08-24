class AddLastReadMeepToListens < ActiveRecord::Migration
  def self.up
    add_column :listens, :last_read_meep, :integer
  end

  def self.down
    remove_column :listens, :last_read_meep
  end
end

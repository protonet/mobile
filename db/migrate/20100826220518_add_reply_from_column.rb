class AddReplyFromColumn < ActiveRecord::Migration
  def self.up
    add_column :tweets, :reply_from, :integer
  end

  def self.down
    remove_column :tweets, :reply_from
  end
end

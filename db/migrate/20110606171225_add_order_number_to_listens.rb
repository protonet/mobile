class AddOrderNumberToListens < ActiveRecord::Migration
  def self.up
    add_column :listens, :order_number, :integer
  end

  def self.down
    remove_column :listens, :order_number
  end
end

class AddFlagsToListens < ActiveRecord::Migration
  def self.up
    unless Listen.column_names.include?("flags")
      add_column :listens, :flags, :integer, :default => 0
      Listen.reset_column_information
      Listen.all.each do |listen|
        listen.update_attribute(:flags, 1)
      end
    end
  end

  def self.down
    remove_column :listens, :flags
  end
end

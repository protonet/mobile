class AddCoupleDataToNetwork < ActiveRecord::Migration
  def self.up
    add_column :networks, :coupled, :boolean
    add_column :networks, :last_data_exchanged, :datetime
    change_column_default :channels, :network_id, 1
  end

  def self.down
    change_column_default :channels, :network_id, nil
    remove_column :networks, :coupled
    remove_column :networks, :last_data_exchanged
  end
end

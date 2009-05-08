class AddTemporaryIdentifierToUser < ActiveRecord::Migration
  def self.up
    add_column :users, :temporary_identifier, :string
  end

  def self.down
    remove_column :users, :temporary_identifier
  end
end

class CreateRealmTable < ActiveRecord::Migration
  def self.up
    create_table :realms do |t|
      t.column :name, :string
    end
  end

  def self.down
    drop_table :realms
  end
end

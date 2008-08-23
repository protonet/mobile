class CreateUserTable < ActiveRecord::Migration
  def self.up
    create_table :users do |t|
      t.column :username, :string
      t.column :hashed_password, :string
      t.column :realm_id, :integer
    end
  end

  def self.down
    drop_table :users
  end
end

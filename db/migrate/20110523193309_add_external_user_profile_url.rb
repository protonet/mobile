class AddExternalUserProfileUrl < ActiveRecord::Migration
  def self.up
    add_column :users, :external_profile_url, :string
  end

  def self.down
    remove_column :users, :external_profile_url
  end
end
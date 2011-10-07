class AddApiRoles < ActiveRecord::Migration
  def self.up
    Role.find_or_create_by_title('api-node')
    Role.find_or_create_by_title('api')
  end

  def self.down
    Role.find_by_title('api-node').destroy
    Role.find_by_title('api').destroy
  end
end

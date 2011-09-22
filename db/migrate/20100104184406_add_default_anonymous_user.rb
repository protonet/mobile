class AddDefaultAnonymousUser < ActiveRecord::Migration
  def self.up
    u = LocalUser.new(:id => 0, :name => 'Anonymous', :login => 'Anonymous')
    u.id = 0 
    u.save_with_validation(false)
  end

  def self.down
    User.find(0).destroy
  end
end

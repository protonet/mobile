class AddDefaultNode < ActiveRecord::Migration
  def self.up
    Node.local
  end

  def self.down
    Node.local.destroy
  end
end

class RemoveStaleListens < ActiveRecord::Migration
  def self.up
    Listen.all.find_all {|l| !l.try(:user)}.each(&:destroy)
  end

  def self.down
    # nothing to do here
  end
end

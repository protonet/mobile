class SetLastReadMeepIds < ActiveRecord::Migration
  def self.up
    Listen.all.each do |listen|
      listen.set_last_read_meep
    end
  end

  def self.down
    # nuttin'
  end
end

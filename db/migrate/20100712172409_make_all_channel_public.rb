class MakeAllChannelPublic < ActiveRecord::Migration
  def self.up
    Channel.all.each do |c|
      c.public = true
      c.save
    end
  end

  def self.down
  end
end

class MakeAllChannelPublic < ActiveRecord::Migration
  def self.up
    Channel.find(:all).each do |c|
      c.public = true
      c.save
    end
  end

  def self.down
  end
end

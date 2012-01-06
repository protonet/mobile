class ClearCrons < ActiveRecord::Migration
  def self.up
    `/usr/bin/crontab -r`
  end

  def self.down
    # nothing to see here move along
  end
end

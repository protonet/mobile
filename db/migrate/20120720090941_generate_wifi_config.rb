class GenerateWifiConfig < ActiveRecord::Migration
  def self.up
    SystemWifi.generate_config
  end

  def self.down
  end
end

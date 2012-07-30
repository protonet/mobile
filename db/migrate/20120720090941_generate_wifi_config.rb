class GenerateWifiConfig < ActiveRecord::Migration
  def self.up
    SystemWifi.generate_config if SystemWifi.supported?
  end

  def self.down
  end
end

class AddDefaultWifiChannel < ActiveRecord::Migration
  def self.up
    unless SystemPreferences.wifi == SystemPreferences.defaults['wifi']
      SystemPreferences.wifi = SystemPreferences.wifi.merge({ 'channel' => SystemPreferences.defaults['wifi']['channel'] })
    end
  end

  def self.down
  end
end

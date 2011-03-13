class AddVpnSettings < ActiveRecord::Migration
  def self.up
    SystemPreferences.vpn = {:identifier => Network.local.uuid, :password => ActiveSupport::SecureRandom.base64(10)}
  end

  def self.down
    # none needed
  end
end

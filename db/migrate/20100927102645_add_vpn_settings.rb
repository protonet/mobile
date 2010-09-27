class AddVpnSettings < ActiveRecord::Migration
  def self.up
    System::Preferences.vpn = {:identifier => Network.local.uuid, :password => ActiveSupport::SecureRandom.base64(10)}
  end

  def self.down
    # none needed
  end
end

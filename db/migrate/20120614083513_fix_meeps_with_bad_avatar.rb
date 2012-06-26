class FixMeepsWithBadAvatar < ActiveRecord::Migration
  def self.up
    Sunspot.batch do
      Meep.includes(:user).all.each do |meep|
        meep.update_attribute(:avatar, meep.user.avatar.to_s) if meep.user
      end
    end
  end

  def self.down
    # not revertable
  end
end

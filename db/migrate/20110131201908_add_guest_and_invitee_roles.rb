class AddGuestAndInviteeRoles < ActiveRecord::Migration
  def self.up
    Role.find_or_create_by_title('guest')
    Role.find_or_create_by_title('invitee')
  end

  def self.down
    Role.find_by_title('guest').destroy
    Role.find_by_title('invitee').destroy
  end
end

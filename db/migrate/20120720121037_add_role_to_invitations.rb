class AddRoleToInvitations < ActiveRecord::Migration
  def self.up
    rename_column :invitations, :invitee_role, :role
    change_column :invitations, :role, :string, :default => 'invitee'
    Invitation.all.each do |invitation|
      new_role = invitation.role == "1" ? "invitee" : "user"
      invitation.update_attribute('role', new_role)
    end
  end

  def self.down
    rename_column :invitations, :role, :invitee_role
    change_column :invitations, :invitee_role, :boolean
    Invitation.all.each do |invitation|
      new_role = invitation.invitee_role == "invitee" ? true : false
      invitation.update_attribute('invitee_role', new_role)
    end
  end
end

class AddAttributesToInvitations < ActiveRecord::Migration
  def self.up
    add_column :invitations, :name, :string
    add_column :invitations, :invitee_role, :boolean, :default => false
    add_column :invitations, :sent_at, :datetime
  end

  def self.down
    remove_column :invitations, :name
    remove_column :invitations, :invitee_role
    remove_column :invitations, :sent_at
  end
end
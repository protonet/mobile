class ChangeInvitationData < ActiveRecord::Migration
  def self.up
    rename_column :invitations, :name, :first_name
    add_column :invitations, :last_name, :string
  end

  def self.down
    rename_column :invitations, :first_name, :name
    remove_column :invitations, :last_name
  end
end
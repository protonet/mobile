class CreateInvitations < ActiveRecord::Migration
  def self.up
    create_table :invitations do |t|
      t.text :message
      t.integer :user_id
      t.string :email
      t.string :token
      t.string :channel_ids
      t.datetime :accepted_at

      t.timestamps
    end
  end

  def self.down
    drop_table :invitations
  end
end

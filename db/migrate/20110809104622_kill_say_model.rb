class KillSayModel < ActiveRecord::Migration
  def self.up
    add_column :meeps, :channel_id, :integer
    ActiveRecord::Base.connection.execute("update meeps left join says on says.meep_id = meeps.id set meeps.channel_id = says.channel_id")
    drop_table :says
  end

  def self.down
    create_table :says, :force => true do |t|
      t.channel_id
      t.meep_id
      t.timestamps
    end
    ActiveRecord::Base.connection.execute("insert into says (SELECT NULL, channel_id, id, NULL, NULL from meeps)")
    remove_column :meeps, :channel_id
  end
end
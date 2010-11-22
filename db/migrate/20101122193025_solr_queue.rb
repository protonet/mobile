class SolrQueue < ActiveRecord::Migration
  def self.up
    Sunspot::IndexQueue::Entry::ActiveRecordImpl.create_table
  end

  def self.down
    drop_table Sunspot::IndexQueue::Entry::ActiveRecordImpl.table_name
  end
end


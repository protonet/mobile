class CreateDelayedJobs < ActiveRecord::Migration
  def self.up
    create_table :delayed_jobs do |t|
      t.string :command
      
      t.timestamps
    end
  end

  def self.down
    drop_table :delayed_jobs
  end
end

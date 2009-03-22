class CreateAudiences < ActiveRecord::Migration
  def self.up
    create_table :audiences do |t|
      t.string  :name
      t.text    :description
      t.timestamps
    end
    # create the default home audience
    Audience.new(:id => 0, :name => 'home', :description => 'your homebase - your node :)').save
  end

  def self.down
    drop_table :audiences
  end
end

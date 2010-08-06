class AddChannelUuidToChannels < ActiveRecord::Migration
  def self.up
    add_column :channels, :uuid, :string
    Channel.all.each do |channel|
      channel.generate_uuid
    end
  end

  def self.down
    remove_column :channels, :uuid
  end
end

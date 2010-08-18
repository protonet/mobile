class AddChannelUuidToChannels < ActiveRecord::Migration
  def self.up
    unless Channel.column_names.include?("uuid")
      add_column :channels, :uuid, :string
      Channel.reset_column_information
      Channel.all.each do |channel|
        channel.generate_uuid
      end
    end
  end

  def self.down
    remove_column :channels, :uuid
  end
end

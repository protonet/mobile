class ChangeChannelNamesToNewCharacterSets < ActiveRecord::Migration
  def self.up
    Channel.all.each do |channel|
      channel.name = channel.name.gsub(/[ ']/, '-')
      channel.save
    end
  end

  def self.down
    # Irreversible -> Data Loss
  end
end

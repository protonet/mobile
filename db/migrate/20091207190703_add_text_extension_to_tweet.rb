class AddTextExtensionToTweet < ActiveRecord::Migration
  def self.up
    add_column :tweets, :text_extension, :text
  end

  def self.down
    remove_column :tweets, :text_extension
  end
end

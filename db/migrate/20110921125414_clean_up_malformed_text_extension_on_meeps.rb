class CleanUpMalformedTextExtensionOnMeeps < ActiveRecord::Migration
  def self.up
    ActiveRecord::Base.connection.execute("UPDATE meeps SET text_extension = '' WHERE text_extension = '\"\"'")
  end

  def self.down
  end
end

class FixYouTubeTextExtensionMigration < ActiveRecord::Migration
  def self.up
    Tweet.all(:conditions => 'text_extension NOT NULL').each do |t|
      hash_values = JSON.parse(t.text_extension) rescue {}
      if (hash_values['type'] == 'YouTube' && hash_values['thumbnail'])
        hash_values['image'] = hash_values['thumbnail']['url']
        t.update_attribute(:text_extension, hash_values.to_json)
      end
    end
  end

  def self.down
  end
end

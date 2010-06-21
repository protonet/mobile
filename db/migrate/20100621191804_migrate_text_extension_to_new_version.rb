class MigrateTextExtensionToNewVersion < ActiveRecord::Migration
  def self.up
    Tweet.all(:conditions => 'text_extension NOT NULL').each do |t|
      hash_values = JSON.parse(t.text_extension) rescue {}
      if(hash_values['type'] == 'Link' && !hash_values['image'])
        (hash_values['image'] = hash_values['thumbnail'])
        t.update_attribute(:text_extension, hash_values.to_json)
      elsif(hash_values['type'] == 'YouTube' && !hash_values['videoId'])
        hash_values['image'] = hash_values['url']
        youtube_id = hash_values['url'].match(/youtube\.com\/watch(\?|#\!)v\=([\w_-]*)/i) && $2
        hash_values['videoId'] = youtube_id
        hash_values['flash'] = "http://www.youtube.com/v/#{youtube_id}?playerapiid=ytplayer&autoplay=1&egm=0&hd=1&showinfo=0&rel=0"
        t.update_attribute(:text_extension, hash_values.to_json)
      end
    end
  end

  def self.down
  end
end

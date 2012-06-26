class ConvertOldFileSystemUrls < ActiveRecord::Migration
  def self.replace_url(str)
    p str
    str.gsub(/\/system\/files\/show\?file_path\=(\S+)/) { "/node/fs/download/?paths=%2Fchannels#{$1}" }
  end
  
  def self.up
    Meep.where("text_extension LIKE '%/system/files/show%' OR message LIKE '%/system/files/show%'").each do |meep|
      meep.message.gsub!(/file\:\/system\/files\/show/) { "http://protonet/system/files/show" }
      meep.message = replace_url(meep.message)
      
      text_extension = JSON.parse(meep.text_extension) rescue nil
      
      if text_extension
        text_extension.each do |key, val|
          if val.is_a? String
            text_extension[key] = replace_url(val)
          elsif val.is_a? Array
            text_extension[key] = val.map do |sub_val|
              sub_val.is_a?(String) ? replace_url(sub_val) : sub_val
            end
          end
        end
        meep.text_extension = text_extension.to_json
      end
      
      meep.save!
    end
  end

  def self.down
  end
end

namespace :report do
  task :raid_fail => :environment do
    last_msg = Rails.cache.read 'last_raid_msg'

    if !last_msg
      SystemReporting.send_message ':exclamation: A hard disk has just dropped out of the RAID array! There is a risk of data loss.
Please contact protonet support ASAP at team@protonet.info.'
      sleep 5
      Rails.cache.write 'last_raid_msg', Time.now

    elsif last_msg + 3.days < Time.now
      SystemReporting.send_message ':exclamation: A drive is still missing from the RAID array!
In order to protect all of your data, this needs to be fixed.
Please contact protonet support ASAP at team@protonet.info if you have not already.'
      sleep 5
      Rails.cache.write 'last_raid_msg', Time.now

    end
  end
  
  task :virus_scan => :environment do
    code = ENV['code'].to_i
    freshclam_code = ENV['freshclam_code'].to_i
    details = URI.unescape(ENV['details'])
    
    case code
    when 0
      msg = ":sun: Virus Scan: System is safe :sun:"
      msg += "\n{text}#{details}{/text}"
      msg += "\nHowever there was an error updating the virus databases (exit code ##{freshclam_code})." if freshclam_code > 0
    when 1
      msg = ":exclamation: Virus Scan: Malicious files found :exclamation:"
      msg += "\n{text}#{details}{/text}"
      msg += "\nIt's highly recommended to delete these files.\nContact protonet support at team@protonet.info if you need help."
    else
      msg = ":exclamation: Virus Scan: Error :exclamation:"
      msg += "\nAn error occured while performing the system check (exit code ##{code}). Please contact protonet support at team@protonet.info."
    end
    SystemReporting.send_message msg
    sleep 5
  end
end

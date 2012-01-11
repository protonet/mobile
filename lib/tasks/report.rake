namespace :report do
  task :raid_fail => :environment do
    last_msg = Rails.cache.read 'last_raid_msg'

    if !last_msg
      SystemReporting.send_message ':exclamation: A hard disk has just dropped out of the RAID array! There is a risk of data loss.
Please contact protonet support ASAP at team@protonet.info.'
      sleep 5
      Rails.cache.write 'last_raid_msg', Time.now

    elsif last_msg + 3.days < Time.now
      SystemReporting.send_message 'A drive is still missing from the RAID array!
In order to protect all of your data, this needs to be fixed.
Please contact protonet support ASAP at team@protonet.info if you have not already.'
      sleep 5
      Rails.cache.write 'last_raid_msg', Time.now

    end
  end
end
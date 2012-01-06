namespace :report do
  task :raid_fail => :environment do
    last_msg = Rails.cache.read 'last_raid_msg'

    if !last_msg
      SystemReporting.send_message 'A drive has just dropped out of the RAID array!
Please contact protonet support ASAP at team@protonet.info.'
      sleep 5
      Rails.cache.write 'last_raid_msg', Time.now

    elsif last_msg + 3.days > Time.now
      SystemReporting.send_message 'A drive is still missing from the RAID array!
Please contact protonet support at team@protonet.info.'
      sleep 5
      Rails.cache.write 'last_raid_msg', Time.now

    end
  end
end

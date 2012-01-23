# Use this file to easily define all of your cron jobs.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Example:
#
# every 2.hours do
#   command "/usr/bin/some_great_command"
#   runner "MyModel.some_method"
#   rake "some:great:rake:task"
# end
#

set(:output, "#{configatron.shared_file_path}/log/cron.log") unless configatron.shared_file_path.nil?

every 4.days do
  runner "User.delete_strangers_older_than_two_days!"
end

# Learn more: http://github.com/javan/whenever

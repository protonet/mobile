desc 'Delete all temp users older than 2 days'
task :delete_temp_users => :environment do
  User.delete_strangers_older_than_two_days!
end


# debugging (via http://duckpunching.com/passenger-mod_rails-for-development-now-with-debugger)
desc 'Restart passenger and start debugging'
task :restart_with_debug do
  system("touch tmp/restart.txt")
  system("touch tmp/debug.txt")
end

desc 'Reset admin getting key'
task :reset_admin_key => :environment do
  System::Preferences.admin_set = false
  System::Preferences.admin_key = ActiveSupport::SecureRandom.base64(10)
  puts "\n\nUse this key to become an admin, can only be used once:\n\n#{System::Preferences.admin_key}\n\nbe careful!"
end

desc 'Reset admin getting key AND all admin users'
task :reset_admin_key_and_users => :environment do
  System::Preferences.admin_set = false
  System::Preferences.admin_key = ActiveSupport::SecureRandom.base64(10)
  User.update_all("admin = 0", "admin = 1")
  puts "\n\nUse this key to become an admin, can only be used once:\n\n#{System::Preferences.admin_key}\n\nbe careful!"
end


# connect to debugger (for passenger) with
# rdebug -c

# helpful settings for your .rdebugrc in your home directory
# set autoeval
# set autolist
# set autoreload

# debugging stuff ends here
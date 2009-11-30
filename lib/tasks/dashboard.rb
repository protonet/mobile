desc 'Delete all temp users older than 2 days'
task :delete_temp_users => :environment do
  User.find(:all, :conditions => {})
end


# debugging (via http://duckpunching.com/passenger-mod_rails-for-development-now-with-debugger)
desc 'Restart passenger and start debugging'
task :restart_with_debug do
  system("touch tmp/restart.txt")
  system("touch tmp/debug.txt")
end

# connect to debugger (for passenger) with
# rdebug -c

# helpful settings for your .rdebugrc in your home directory
# set autoeval
# set autolist
# set autoreload

# debugging stuff ends here
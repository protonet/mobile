desc 'Delete all temp users older than 2 days'
task :delete_temp_users => :environment do
  User.find(:all, :conditions => {})
end
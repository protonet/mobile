#!/usr/bin/env ruby
require 'yaml'
require 'mysql2'
require 'erb'

config_path = File.expand_path("../config/database.yml", File.dirname(__FILE__))
config_file = YAML::load(ERB.new(File.read(config_path)).result)
config = config_file[ENV['RAILS_ENV']]

begin
  client = Mysql2::Client.new( 
    :host => config['host'],
    :database => config['database'],
    :username => config['username'],
    :password => config['password'] 
  )
  result = client.query 'select count(id) from delayed_jobs where return_value IS NULL', :as => :array
  remainig_jobs_count = result.first[0]
    
  if remainig_jobs_count > 0
    `cd #{ENV['RAILS_ROOT']} && bundle exec script/rails runner -e #{ENV['RAILS_ENV']} 'DelayedJob.process' #{ENV['RAILS_ROOT']}/log/delayed_job.log`
  end
    
rescue Mysql2::Error => e
  puts e.errno
  puts e.error    
ensure
  client.close if client
end
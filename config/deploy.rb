set :application, "dashboard"
set :repository,  "git@github.com:protonet/dashboard.git"

# deploy paths are set in the stage definitions
set :deploy_via, :copy
set :copy_cache, true
set :copy_exclude, ".git/*"
set :git_enable_submodules, 1

set :scm, :git

namespace :deploy do
  
  desc "first run"
  task :first_run, :roles => :app do
    setup
    update_code
    setup_db
  end
  
  # use deploy:setup first ;)
  desc "prepare node for installation"
  task :prepare, :roles => :app do
    # create needed directories
    run "mkdir -p #{shared_path}/log"
    run "mkdir -p #{shared_path}/db"
    run "mkdir -p #{shared_path}/user-files; chmod 770 #{shared_path}/user-files"
    run "mkdir -p #{shared_path}/avatars; chmod 770 #{shared_path}/avatars"
    run "mkdir -p #{shared_path}/pids; chmod 770 #{shared_path}/pids"
    run "mkdir -p #{shared_path}/system"
    run "mkdir -p #{shared_path}/config"
    run "mkdir -p #{shared_path}/config/monit.d"
    run "mkdir -p #{shared_path}/config/hostapd.d"
    run "mkdir -p #{shared_path}/config/dnsmasq.d"
    run "mkdir -p #{shared_path}/config/ifconfig.d"
    run "mkdir -p #{shared_path}/solr/data"
  end
  
  desc "deploy monit configuration"
  task :monit, :roles => :app do
    monit_command = "monit -c #{shared_path}/config/monit_ptn_node -l #{shared_path}/log/monit.log -p #{shared_path}/pids/monit.pid"
    top.upload(StringIO.new(ERB.new(IO.read("config/monit/monit_ptn_node.erb")).result(binding)), "#{shared_path}/config/monit_ptn_node")
    run "chmod 700 #{shared_path}/config/monit_ptn_node"
    # and restart monit
    run monit_command + " quit"
    sleep 2
    run monit_command
  end
  
  desc "copy stage dependent config files"
  task :copy_stage_config, :roles => :app do
    run "if [ -f #{release_path}/config/stage_configs/#{stage}.rb ]; then cp #{release_path}/config/stage_configs/#{stage}.rb #{release_path}/config/environments/stage.rb; fi"
  end
  
  task :restart, :roles => :app do
    # do nothing
  end
  
  desc "create the database on if it doesn't exist"
  task :setup_db do
    run "cd #{current_release}; mysql -u root dashboard_production -e \"show tables;\" 2>&1 > /dev/null; if [ $? -ne 0 ] ;then sh -c \"RAILS_ENV=production bundle exec rake db:setup\"; fi"
  end
  
end

namespace :passenger do
  desc "Restart Application"
  task :restart do
    run "touch #{current_path}/tmp/restart.txt"
  end
end

namespace :bundler do
  task :create_symlink, :roles => :app do
    shared_dir = File.join(shared_path, 'bundle')
    release_dir = File.join(release_path, '.bundle')
    run("mkdir -p #{shared_dir} && ln -s #{shared_dir} #{release_dir}")
  end
  
  task :bundle_new_release, :roles => :app do
    bundler.create_symlink
    run "cd #{release_path}; bundle check 2>&1 > /dev/null ; if [ $? -ne 0 ] ; then sh -c \"bundle install --without test --without cucumber\" ; fi"
  end
  
  task :lock, :roles => :app do
    run "cd #{current_release} && bundle lock;"
  end
  
  task :unlock, :roles => :app do
    run "cd #{current_release} && bundle unlock;"
  end
end

# HOOKS
after "deploy:setup", "deploy:prepare"
after "deploy:cold", "setup_db"
after "deploy:update_code", "bundler:bundle_new_release"
after "deploy:finalize_update", "deploy:copy_stage_config"
after "deploy", "deploy:cleanup"
after "deploy:start", "passenger:restart", "deploy:monit"
after "deploy:restart", "passenger:restart", "deploy:monit"

# HOPTOAD
Dir[File.join(File.dirname(__FILE__), '..', 'vendor', 'gems', 'hoptoad_notifier-*')].each do |vendored_notifier|
  $: << File.join(vendored_notifier, 'lib')
end

require 'hoptoad_notifier/capistrano'

set :application, "dashboard"
set :repository,  "git@github.com:dudemeister/protonet-dashboard.git"

# If you aren't deploying to /u/apps/#{application} on the target
# servers (which is the default), you can specify the actual location
# via the :deploy_to variable:
set :deploy_to, "~/dashboard"
set :deploy_via, :copy
set :copy_cache, true
set :copy_exclude, ".git/*"
set :git_enable_submodules, 1

set :user, "protonet"
# todo: change this to www-data or something
set :runner, "protonet"

set :scm, :git

role :app, "protonet-7.local"
role :web, "protonet-7.local"
role :db,  "protonet-7.local", :primary => true

namespace :deploy do
  
  desc "prepare node for installation"
  task :prepare, :roles => :app do
    # create needed directories
    run "mkdir -p ~/dashboard/shared/log"
    run "mkdir -p ~/dashboard/shared/db"
    run "mkdir -p ~/dashboard/shared/user-files"
    run "mkdir -p ~/dashboard/shared/pids"
    run "mkdir -p ~/dashboard/shared/system"
    run "mkdir -p ~/dashboard/releases"
  end
  
  desc "deploy monit configuration"
  task :monit, :roles => :app do
    upload_monit_file
    # move it to the correct location
    sudo "mv /home/protonet/dashboard/shared/monit_ptn_node /etc/monit"
    # and restart monit
    sudo "/etc/init.d/monit restart"
  end

  desc "prepare user data db"
  task :database, :roles => :app do
    run "ln -s ~/dashboard/shared/db ~/dashboard/current/db/shared"
  end
  
end

namespace :passenger do
  desc "Restart Application"
  task :restart do
    run "touch #{current_path}/tmp/restart.txt"
  end
end


after "deploy", "deploy:database"
after "deploy", "deploy:cleanup"
after "deploy", "passenger:restart"


def upload_monit_file
  upload("config/monit/monit_ptn_node", "/home/protonet/dashboard/shared/monit_ptn_node")
end
set :application, "dashboard"
set :repository,  "git@github.com:dudemeister/protonet-dashboard.git"

# If you aren't deploying to /u/apps/#{application} on the target
# servers (which is the default), you can specify the actual location
# via the :deploy_to variable:

deploy_to_path = (ENV["LIVE"] ? "/var/www/protonet-dashboard" : "~/dashboard")
set :deploy_to, deploy_to_path
set :deploy_via, :copy
set :copy_cache, true
set :copy_exclude, ".git/*"
set :git_enable_submodules, 1

set(:use_sudo, false) if ENV["LIVE"]

set :user, "www-data"
# todo: change this to www-data or something
set :runner, "www-data"

set :scm, :git

target_node = "protonet-deploy" # || ENV["NODE"] || "protonet-7.local"

role :app, target_node
role :web, target_node
role :db,  target_node, :primary => true

namespace :deploy do
  
  desc "prepare node for installation"
  task :prepare, :roles => :app do
    # create needed directories
    run "mkdir -p #{deploy_to_path}/shared/log"
    run "mkdir -p #{deploy_to_path}/shared/db"
    run "mkdir -p #{deploy_to_path}/shared/user-files"
    run "mkdir -p #{deploy_to_path}/shared/avatars"
    run "mkdir -p #{deploy_to_path}/shared/pids"
    run "mkdir -p #{deploy_to_path}/shared/system"
    run "mkdir -p #{deploy_to_path}/releases"
  end
  
  desc "deploy monit configuration"
  task :monit, :roles => :app do
    upload_monit_file
    # move it to the correct location
    sudo "mv /home/protonet/dashboard/shared/monit_ptn_node /etc/monit/"
    # and restart monit
    sudo "/etc/init.d/monit restart"
  end

  desc "set all the necessary symlinks"
  task :create_protonet_symlinks, :roles => :app do
    # db symlink
    run "ln -s #{shared_path}/db #{release_path}/db/shared"
  end
  
end

namespace :passenger do
  desc "Restart Application"
  task :restart do
    run "touch #{current_path}/tmp/restart.txt"
  end
end


after "deploy:finalize_update", "deploy:create_protonet_symlinks"
after "deploy", "deploy:cleanup"
after "deploy", "passenger:restart"


def upload_monit_file
  upload("config/monit/monit_ptn_node", "/home/protonet/dashboard/shared/monit_ptn_node")
end
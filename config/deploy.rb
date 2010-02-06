set :application, "dashboard"
set :repository,  "git@github.com:dudemeister/protonet-dashboard.git"

# deploy paths are set in the stage definitions
set :deploy_via, :copy
set :copy_cache, true
set :copy_exclude, ".git/*"
set :git_enable_submodules, 1

set :scm, :git

namespace :deploy do
  
  desc "prepare node for installation"
  task :prepare, :roles => :app do
    # create needed directories
    run "mkdir -p #{shared_path}/log"
    run "mkdir -p #{shared_path}/db"
    run "mkdir -p #{shared_path}/user-files; chmod 770 #{shared_path}/user-files"
    run "mkdir -p #{shared_path}/avatars; chmod 770 #{shared_path}/avatars"
    run "mkdir -p #{shared_path}/pids; chmod 770 #{shared_path}/pids"
    run "mkdir -p #{shared_path}/system"
    run "if [ ! -f #{shared_path}/db/production.sqlite ]; then touch #{shared_path}/db/production.sqlite3; chmod 770 #{shared_path}/db/production.sqlite3; fi"
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
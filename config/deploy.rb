set :application, "dashboard"
set :repository,  "git@github.com:dudemeister/protonet-dashboard.git"

# deploy paths are set in the stage definitions
set :deploy_via, :copy
set :copy_cache, true
set :copy_exclude, ".git/*"
set :git_enable_submodules, 1

set :scm, :git

namespace :deploy do
  
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
    run "if [ ! -f #{shared_path}/db/production.sqlite ]; then touch #{shared_path}/db/production.sqlite3; chmod 770 #{shared_path}/db/production.sqlite3; fi"
  end
  
  desc "deploy monit configuration"
  task :monit, :roles => :app do
    monit_command = "monit -c #{shared_path}/system/monit_ptn_node -l #{shared_path}/log/monit.log -p #{shared_path}/pids/monit.pid"
    monit_config_string = File.read("config/monit/monit_ptn_node").gsub(/\$shared_path\$/, shared_path).gsub(/\$current_path\$/, current_path)
    top.upload(StringIO.new(monit_config_string), "#{shared_path}/system/monit_ptn_node")
    run "chmod 700 #{shared_path}/system/monit_ptn_node"
    # and restart monit
    run monit_command + " quit"
    sleep 1
    run monit_command
  end

  desc "set all the necessary symlinks"
  task :create_protonet_symlinks, :roles => :app do
    # db symlink
    run "ln -s #{shared_path}/db #{release_path}/db/shared"
  end
  
  desc "copy stage dependent config files"
  task :copy_stage_config, :roles => :app do
    run "if [ -f #{release_path}/config/stage_configs/#{stage}.rb ]; then cp #{release_path}/config/stage_configs/#{stage}.rb #{release_path}/config/environments/stage.rb; fi"
  end
  
  task :restart, :roles => :app do
    # do nothing
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
    release_dir = File.join(current_release, '.bundle')
    run("mkdir -p #{shared_dir} && ln -s #{shared_dir} #{release_dir}")
  end
  
  task :bundle_new_release, :roles => :app do
    bundler.create_symlink
    run "cd #{release_path} && bundle install --without test --without cucumber"
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
after "deploy:update_code", "bundler:bundle_new_release"
after "deploy:finalize_update", "deploy:copy_stage_config"
after "deploy:finalize_update", "deploy:create_protonet_symlinks"
after "deploy", "deploy:cleanup"
after "deploy:start", "passenger:restart", "deploy:monit"
after "deploy:restart", "passenger:restart", "deploy:monit"
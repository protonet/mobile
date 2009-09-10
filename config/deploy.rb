set :application, "dashboard"
set :repository,  "git@github.com:dudemeister/protonet-dashboard.git"

# If you aren't deploying to /u/apps/#{application} on the target
# servers (which is the default), you can specify the actual location
# via the :deploy_to variable:
set :deploy_to, "~/dashboard"
set :deploy_via, :copy
set :copy_cache, true
set :copy_exclude, ".git/*"

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
    run "mkdir -p ~/dashboard/releases"
    run "mkdir -p ~/dashboard/user-files"
  end
end

after "deploy", "deploy:cleanup"

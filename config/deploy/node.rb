target_node = ENV["NODE"] || "protonet-deploy"
role :app, target_node
role :web, target_node
role :db,  target_node, :primary => true

set :deploy_to, "/home/protonet/dashboard"
set :use_sudo, false

set :user, "protonet"
set :runner, "protonet"
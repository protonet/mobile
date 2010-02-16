role :app, "172.20.3.185"
role :web, "172.20.3.185"
role :db,  "172.20.3.185", :primary => true

set :deploy_to, "/home/protonet/dashboard"
set :use_sudo, false

set :user, "protonet"
set :runner, "protonet"

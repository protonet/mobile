role :app, "172.16.110.128"
role :web, "172.16.110.128"
role :db,  "172.16.110.128", :primary => true

set :deploy_to, "/home/protonet/dashboard"
set :use_sudo, false

set :user, "protonet"
set :runner, "protonet"

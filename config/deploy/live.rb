# define protonet-live in your host file, this is our current server 188.40.33.5
role :app, "protonet-live"
role :web, "protonet-live"
role :db,  "protonet-live", :primary => true

set :deploy_to, "/var/www/protonet-dashboard"
set :use_sudo, false

set :user, "www-data"
set :runner, "www-data"

# define protonet-live in your host file, this is our current server 188.40.33.5
role :app, "protonet-live"
role :web, "protonet-live"
role :db,  "protonet-live", :primary => true

set :deploy_to, "/home/jelveh/protonet-dashboard"
set :use_sudo, false

set :user, "jelveh"
set :runner, "jelveh"

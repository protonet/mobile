require 'rubygems'        # if you use RubyGems
require 'daemons'

shared_path = File.exists?("/var/www/protonet-dashboard/shared/user-files") ? "/var/www/protonet-dashboard/shared/user-files" : "/home/protonet/dashboard/shared/pids"
Daemons.run(File.join(File.dirname(__FILE__), 'event_machine/js_dispatching_server.rb'), {:dir_mode => :normal, :dir => shared_path})


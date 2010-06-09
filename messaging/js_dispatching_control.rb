require 'rubygems'
require 'daemons'

shared_path = File.exists?("/home/jelveh/protonet-dashboard/shared") ? "/home/jelveh/protonet-dashboard/shared" : "/home/protonet/dashboard/shared"
Daemons.run(
  File.join(File.dirname(__FILE__),'event_machine/js_dispatching_server.rb'),
  {
    :dir_mode => :normal,
    :dir => shared_path + "/pids",
    :log_output => shared_path + "/log"
  }
)


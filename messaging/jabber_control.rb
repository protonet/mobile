require 'rubygems'
require 'daemons'

shared_path = File.exists?("/home/jelveh/protonet-dashboard/shared") ? "/home/jelveh/protonet-dashboard/shared" : "/home/protonet/dashboard/shared"
Daemons.run(
  File.join(File.dirname(__FILE__),'event_machine/jabber.rb'),
  {
    :dir_mode => :normal,
    :dir => "tmp/pids",
    :log_output => "log"
  }
)


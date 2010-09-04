require 'rubygems'
require 'daemons'

Daemons.run(
  File.join(File.dirname(__FILE__),'event_machine/js_dispatching_server.rb'),
  {
    :dir_mode => :normal,
    :dir => "tmp/pids",
    :log_output => "log"
  }
)


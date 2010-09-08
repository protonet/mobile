require 'rubygems'
require 'daemons'

Daemons.run(
  File.join(File.dirname(__FILE__),'event_machine/js_dispatching_server.rb'),
  {
    :app_name   => "js_dispatcher_#{ENV["RAILS_ENV"]}",
    :dir_mode   => :normal,
    :dir        => "tmp/pids",
    :log_output => "log"
  }
)


require 'rubygems'        # if you use RubyGems
require 'daemons'

Daemons.run(File.join(File.dirname(__FILE__), 'event_machine/js_dispatching_server.rb'), {:dir => './../../../shared/pids'})


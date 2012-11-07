#!/usr/bin/env ruby
require 'rubygems'
require 'daemons'

Daemons.run(
  File.join(File.dirname(__FILE__),'mobile_server.rb'),
  {
    :app_name   => "mobile_#{ENV['RACK_ENV']}",
    :dir_mode   => :normal,
    :dir        => "tmp",
    :log_output => "log"
  }
)


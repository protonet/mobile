#!/usr/bin/env ruby

def rvm_script
  rvm = `which rvm`
  rvm.gsub(/bin\/rvm\n$/, "scripts/rvm")
end

def bundle_cleanup
  "unset RUBYOPT; unset GEM_HOME; unset GEM_PATH; unset BUNDLE_GEMFILE; . #{rvm_script}; rvm use ruby-1.9.3-p194@protonet-mobile"
end

def mobile_command
  "#{bundle_cleanup}; cd #{File.dirname(__FILE__)}; bundle exec rackup -p #{ENV['MOBILE_PORT']} --pid tmp/mobile_#{ENV['RACK_ENV']}.pid"
end

system("bash -l -c '#{mobile_command}'")

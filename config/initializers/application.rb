if Rails.env.development?
  require "#{Rails.root}/lib/backend_adapters/development_mock"
  SystemBackend.backend_connection = BackendAdapters::DevelopmentMock.new
  puts "Backend '#{SystemBackend.backend_connection.info}' connected successfully!"
  
  if File.exists?(File.join(Rails.root, 'tmp', 'debug.txt'))
    require 'ruby-debug'
    Debugger.wait_connection = true
    Debugger.start_remote
    File.delete(File.join(Rails.root, 'tmp', 'debug.txt'))
  end
end
  
# json settings
ActiveSupport::JSON.backend = 'JSONGem'

# amqp settings
require 'rabbit'

require 'mq'
AMQP.settings[:vhost] = configatron.amqp.vhost.nil? ? '/' : configatron.amqp.vhost

unless (defined?(RUN_FROM_DISPATCHER) && RUN_FROM_DISPATCHER) || (defined?(PhusionPassenger) && Rails.env == 'production')
  # this starts the eventmachine reactor in a new thread
  # since the Em.run block is blocking until stopped this will ensure
  # that amqp communications are not blocking the app at any time
  Thread.new{ EM.run() }
end

# Check systems in script/server mode (stuff like passenger runs them some other way?)
if (ENV['SERVER_SOFTWARE'].try(:match, /nginx/) && !Rails.env.production? || ENV['_'].match(/rails/)) && !(defined?(RUN_FROM_DISPATCHER) && RUN_FROM_DISPATCHER)
  SystemServices.start_all

  at_exit do
    SystemServices.stop_all
  end
end

if defined?(PhusionPassenger)
  PhusionPassenger.on_event(:starting_worker_process) do |forked|
    require "#{Rails.root}/lib/rack_ext.rb" # overwrite multipart parsing
    if forked
      # We're in smart spawning mode.
      Thread.new{ EM.run() }
    else
      # We're in conservative spawning mode. We don't need to do anything.
    end
  end
end
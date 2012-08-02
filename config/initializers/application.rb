Dashboard::Application.config.to_prepare do
  system_backend = case Rails.env
    when "production"
      "ubuntu"
    else
      "development_mock"
  end
  
  require "#{Rails.root}/lib/backend_adapters/#{system_backend}"
  SystemBackend.backend_connection = "BackendAdapters::#{system_backend.camelize}".constantize.new
  puts "Backend '#{SystemBackend.backend_connection.info}' connected successfully!"
end

require 'uuid4r'
require "#{Rails.root}/lib/linux/commands"
require 'ifconfig'
require 'ip'

if Rails.env.production?
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
if (!defined?(PhusionPassenger) && defined?(Rails::Server))
  SystemServices.start_all

  at_exit do
    SystemServices.stop_all unless ENV["NOSTOP"].to_i == 1
  end
end

if defined?(PhusionPassenger)
  PhusionPassenger.on_event(:starting_worker_process) do |forked|
    if forked
      # We're in smart spawning mode.
      Thread.new{ EM.run() }
    else
      # We're in conservative spawning mode. We don't need to do anything.
    end
  end
end

configatron.max_list_size = 1500
configatron.default_avatar = '/img/user_picture_r4.png'
configatron.system_avatar = '/img/system_picture_r2.png'

require 'net/ldap'

require 'protonet_email_service'

port_file_path = "#{Rails.root}/tmp/app_port_#{Rails.env}"
configatron.web_app_port = File.read(port_file_path).to_i if File.exists?(port_file_path)

SystemPublishToWeb.queue_ssl_cert rescue nil


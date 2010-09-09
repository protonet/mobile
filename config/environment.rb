# Be sure to restart your server when you modify this file

# Specifies gem version of Rails to use when vendor/rails is not present
RAILS_GEM_VERSION = '2.3.5' unless defined? RAILS_GEM_VERSION

# Bootstrap the Rails environment, frameworks, and default configuration
require File.join(File.dirname(__FILE__), 'boot')

# for app wide configurations
require "configatron"

#  hack this needs to be removed
require "#{RAILS_ROOT}/lib/rack_ext.rb" if defined?(Rack) && !defined?(PhusionPassenger)

Rails::Initializer.run do |config|
  # Settings in config/environments/* take precedence over those specified here.
  # Application configuration should go into files in config/initializers
  # -- all .rb files in that directory are automatically loaded.

  # Add additional load paths for your own custom dirs
  # config.load_paths += %W( #{RAILS_ROOT}/extras )
  config.load_paths += %W( #{RAILS_ROOT}/app/middleware )

  # Only load the plugins named here, in the order given (default is alphabetical).
  # :all can be used as a placeholder for all plugins not explicitly named
  # config.plugins = [ :exception_notification, :ssl_requirement, :all ]

  # Activate observers that should always be running
  # config.active_record.observers = :cacher, :garbage_collector, :forum_observer

  # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
  # Run "rake -D time" for a list of tasks for finding time zone names.
  config.time_zone = 'UTC'

  # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
  # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}')]
  # config.i18n.default_locale = :de

  config.cache_store = :mem_cache_store
end

ActiveSupport::JSON.backend = 'JSONGem'

# fleximage monkey patch
require "#{RAILS_ROOT}/lib/fleximage_ext.rb"

require 'mq'
AMQP.settings[:vhost] = configatron.amqp.vhost.nil? ? '/' : configatron.amqp.vhost

unless (defined?(RUN_FROM_DISPATCHER) && RUN_FROM_DISPATCHER) || defined?(PhusionPassenger)
  # this starts the eventmachine reactor in a new thread
  # since the Em.run block is blocking until stopped this will ensure
  # that amqp communications are not blocking the app at any time
  Thread.new{ EM.run() }
end


################################# CHECK SYSTEMS IN INTERACTIVE (script/server) MODE #######################################

if ENV["_"].match(/script\/server/) && !(defined?(RUN_FROM_DISPATCHER) && RUN_FROM_DISPATCHER)

  # this starts up a new node.js instance
  node = DaemonController.new(
     :identifier    => 'node.js',
     :start_command => 'node node/node.js',
     :ping_command  => lambda { TCPSocket.new('localhost', 8124) },
     :pid_file      => 'tmp/pids/node.pid',
     :log_file      => 'log/node.log',
     :timeout       => 25,
     :daemonize_for_me => true
  )
  node.start unless node.running?

  # this starts up a new node.js instance
  js_dispatching_server = DaemonController.new(
     :identifier    => 'js_dispatching_server',
     :start_command => 'ruby messaging/js_dispatching_control.rb start',
     :stop_command  => 'ruby messaging/js_dispatching_control.rb stop',
     :ping_command  => lambda { TCPSocket.new('localhost', configatron.socket.port) },
     :pid_file      => "tmp/pids/js_dispatcher_#{Rails.env}.pid",
     :log_file      => "log/js_dispatcher_#{Rails.env}.output",
     :timeout       => 45
  )
  js_dispatching_server.start unless js_dispatching_server.running?

  # this starts up a new sunspot and solr instance
  solr_server = DaemonController.new(
     :identifier    => 'solr_server',
     :start_command => "sunspot-solr start -p 8983 -s solr --pid-dir=tmp/pids -d solr/data",
     :stop_command  => "sunspot-solr stop  -p 8983 -s solr --pid-dir=tmp/pids -d solr/data",
     :ping_command  => lambda { TCPSocket.new('localhost', 8983) },
     :pid_file      => "tmp/pids/sunspot-solr.pid",
     :log_file      => "log/sunspot-solr-#{Rails.env}.log",
     :timeout       => 60
  )
  solr_server.start unless solr_server.running?

  # Checking all Subsystems
  puts "------------------------"
  puts "Checking all subsystems:"
  puts "                        "

  colored_on  = "\e[1m\e[32m[ ON]\e[0m"
  colored_off = "\e[1m\e[31m[OFF]\e[0m"

  # checking the messaging bus
  configatron.messaging_bus_active = System::MessagingBus.active?
  puts "RABBIT MQ:      #{configatron.messaging_bus_active ? colored_on : colored_off}"

  configatron.js_dispatching_active = js_dispatching_server.running?
  puts "JS DISPATCHING: #{configatron.js_dispatching_active ? "#{colored_on}" : colored_off}"

  configatron.nodejs_active = node.running?
  puts "NODE JS:        #{configatron.nodejs_active ? "#{colored_on}" : colored_off}"

  configatron.sunspot_active = solr_server.running?
  puts "SUNSPOT/SOLR:   #{configatron.sunspot_active ? "#{colored_on}" : colored_off}"

  configatron.ldap.active = false
  puts "LDAP:           #{configatron.ldap.active ? colored_on : colored_off}"
  puts "                        "
  puts "------------------------"

end

###########################################################################################################################

if defined?(PhusionPassenger)
    PhusionPassenger.on_event(:starting_worker_process) do |forked|
      require "#{RAILS_ROOT}/lib/rack_ext.rb" # overwrite multipart parsing
        if forked
            # We're in smart spawning mode.
            Thread.new{ EM.run() }
        else
            # We're in conservative spawning mode. We don't need to do anything.
        end
    end
end


at_exit do
  if defined?(node) && node
    puts "shutting down node..."
    node.stop
  end
  if defined?(js_dispatching_server) && js_dispatching_server
    puts "shutting down the dispatcher"
    js_dispatching_server.stop
  end
  if defined?(solr_server) && solr_server
     puts "shutting down the solr server"
     solr_server.stop
 end
end

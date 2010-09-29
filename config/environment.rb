# Be sure to restart your server when you modify this file

# Specifies gem version of Rails to use when vendor/rails is not present
RAILS_GEM_VERSION = '2.3.5' unless defined? RAILS_GEM_VERSION

# Bootstrap the Rails environment, frameworks, and default configuration
require File.join(File.dirname(__FILE__), 'boot')

# for app wide configurations
require 'configatron'

# UUID4r
require 'uuid4r'

# ruby ip foo
require 'ip'

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

# json settings
ActiveSupport::JSON.backend = 'JSONGem'

# fleximage monkey patch
require "#{RAILS_ROOT}/lib/fleximage_ext.rb"

# amqp settings
require 'mq'
AMQP.settings[:vhost] = configatron.amqp.vhost.nil? ? '/' : configatron.amqp.vhost

unless (defined?(RUN_FROM_DISPATCHER) && RUN_FROM_DISPATCHER) || defined?(PhusionPassenger)
  # this starts the eventmachine reactor in a new thread
  # since the Em.run block is blocking until stopped this will ensure
  # that amqp communications are not blocking the app at any time
  Thread.new{ EM.run() }
end

# Check systems in script/server mode (stuff like passenger runs them some other way?)
if ENV['_'].match(/script\/server/) && !(defined?(RUN_FROM_DISPATCHER) && RUN_FROM_DISPATCHER)
  System::Services.start_all
  
  at_exit do
    System::Services.stop_all
  end
end

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

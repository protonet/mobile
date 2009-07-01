# Be sure to restart your server when you modify this file

# Specifies gem version of Rails to use when vendor/rails is not present
RAILS_GEM_VERSION = '2.3.2' unless defined? RAILS_GEM_VERSION

# Bootstrap the Rails environment, frameworks, and default configuration
require File.join(File.dirname(__FILE__), 'boot')

require "configatron"
configatron.use_ldap = true

Rails::Initializer.run do |config|
  # Settings in config/environments/* take precedence over those specified here.
  # Application configuration should go into files in config/initializers
  # -- all .rb files in that directory are automatically loaded.

  # Add additional load paths for your own custom dirs
  # config.load_paths += %W( #{RAILS_ROOT}/extras )

  # Specify gems that this application depends on and have them installed with rake gems:install
  config.gem "eventmachine"
  config.gem "tmm1-amqp", :lib => "mq"
  config.gem "json"
  config.gem "sprockets"
  # config.gem "bj"
  # config.gem "hpricot", :version => '0.6', :source => "http://code.whytheluckystiff.net"
  config.gem "sqlite3-ruby", :lib => "sqlite3"
  # config.gem "aws-s3", :lib => "aws/s3"

  # Only load the plugins named here, in the order given (default is alphabetical).
  # :all can be used as a placeholder for all plugins not explicitly named
  # config.plugins = [ :exception_notification, :ssl_requirement, :all ]

  # Skip frameworks you're not going to use. To use Rails without a database,
  # you must remove the Active Record framework.
  # config.frameworks -= [ :active_record, :active_resource, :action_mailer ]

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

# FIX THE FOLLOWING:
# take configuration or default backend
# BackendAdapters::Ubuntu.new
# Backend.backend_connection = BackendAdapters.const_get((Merb::Config[:backend_adapter] ||= :development_mock).to_s.to_const_string).new
# Merb.logger.info("Backend '#{Backend.backend_connection.info}' connected successfully!")

# this starts the eventmachine reactor in a new thread
# since the Em.run block is blocking until stopped this will ensure
# that amqp communications are not blocking the app at any time
Thread.new{ EM.run() } unless (defined?(RUN_FROM_DISPATCHER) && RUN_FROM_DISPATCHER) || defined?(PhusionPassenger)

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
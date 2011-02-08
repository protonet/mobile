# Put this in config/application.rb
require File.expand_path('../boot', __FILE__)

module Dashboard
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
  
    # Add additional load paths for your own custom dirs
    # config.load_paths += %W( #{Rails.root}/extras )
    config.load_paths += %W( #{Rails.root}/app/middleware )
  
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
  
  # amqp settings
  require 'mq'
  AMQP.settings[:vhost] = configatron.amqp.vhost.nil? ? '/' : configatron.amqp.vhost
  
  unless (defined?(RUN_FROM_DISPATCHER) && RUN_FROM_DISPATCHER) || (defined?(PhusionPassenger) && Rails.env == 'production')
    # this starts the eventmachine reactor in a new thread
    # since the Em.run block is blocking until stopped this will ensure
    # that amqp communications are not blocking the app at any time
    Thread.new{ EM.run() }
  end
  
  # Check systems in script/server mode (stuff like passenger runs them some other way?)
  if (ENV['SERVER_SOFTWARE'].try(:match, /nginx/) && Rails.env != 'production' || ENV['_'].match(/script\/server/)) && !(defined?(RUN_FROM_DISPATCHER) && RUN_FROM_DISPATCHER)
    System::Services.start_all
  
    at_exit do
      System::Services.stop_all
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
end
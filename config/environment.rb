# Be sure to restart your server when you modify this file

# Specifies gem version of Rails to use when vendor/rails is not present
RAILS_GEM_VERSION = '2.3.2' unless defined? RAILS_GEM_VERSION

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

ActiveSupport::JSON.backend = 'JSONGem'

# this starts the eventmachine reactor in a new thread
# since the Em.run block is blocking until stopped this will ensure
# that amqp communications are not blocking the app at any time
Thread.new{ EM.run() } unless (defined?(RUN_FROM_DISPATCHER) && RUN_FROM_DISPATCHER) || defined?(PhusionPassenger)

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

unless (defined?(RUN_FROM_DISPATCHER) && RUN_FROM_DISPATCHER) || defined?(PhusionPassenger)
  # Checking all Subsystems
  puts "------------------------"
  puts "Checking all subsystems:"
  puts "                        "
  
  colored_on  = "\e[1m\e[32m[ ON]\e[0m"
  colored_off = "\e[1m\e[31m[OFF]\e[0m"
  # checking the messaging bus
  configatron.messaging_bus_active = System::MessagingBus.active?
  puts "RABBIT MQ:      #{configatron.messaging_bus_active ? colored_on : colored_off}"
  
  
  # checking on the js dispatching server
  require 'net/telnet'
  configatron.js_dispatching_active = begin
    host = Net::Telnet.new({'Host' => '127.0.0.1', 'Port' => '5000'})
    host.close
    true
  rescue Errno::ECONNREFUSED
    false
  end
  puts "JS DISPATCHING: #{configatron.js_dispatching_active ? "#{colored_on}" : colored_off}"
  
  # checking ldap
  configatron.ldap_active = begin
    false
  end
  puts "LDAP:           #{configatron.ldap_active ? colored_on : colored_off}"
  
  puts "                        "
  puts "------------------------"
end

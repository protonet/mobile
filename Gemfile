source :gemcutter
source 'http://gems.github.com/'

gem "rails", "3.0.5"
gem "bundler", "1.0.11"
gem "mysql"
gem "devise", "1.2.1" # if you update this please check the monkeypatches in user.rb (methods and lines after declaration) and lib/devise_ext.rb
gem "memcache-client"
gem "httparty", "0.7.4"
gem "configatron", "2.6.3"
gem "ruby-debug", "0.10.3"
gem "eventmachine", "1.0.0.beta.2"
gem "fishman-eventmachine_httpserver", "0.2.2"
gem "em-websocket", "0.3.5"
gem "tmm1-amqp", "0.6.4"
gem "json", "~> 1.4.3"
gem "daemons", "1.0.10"
gem "ruby-net-ldap", "0.0.4"
gem "capistrano", "2.5.19"
gem "capistrano-ext", "1.2.1"
gem "daemon_controller", "~> 0.2.6"
gem "sunspot", :git => "git://github.com/protonet/sunspot.git"
gem "sunspot_rails"
gem "sunspot_index_queue"
gem "will_paginate", "3.0.pre2"
gem "ruby-ip", "0.9.0"
gem "hoptoad_notifier"
gem "dudemeister-uuid4r", "0.1.3"
gem "declarative_authorization", "~> 0.5.2"
gem "paperclip", "~> 2.3.8"
gem "newrelic_rpm"
gem "sprockets"
gem "sprockets-rails", :require => "sprockets-rails", :git => "git://github.com/dudemeister/sprockets-rails.git"
gem "activeldap3", :require => "active_ldap" #, :git => "git://github.com/asynchrony/activeldap.git", :branch => "rails3"
gem "ruby-ifconfig", :git => 'git://github.com/dudemeister/ruby-ifconfig.git'
gem 'jquery-rails'
gem 'redcarpet'
gem 'protolink', :git => "git://github.com/protonet/protolink.git"

group :development do
  gem 'foreman'
end

group :test, :cucumber do
  gem "jeremymcanally-context", "0.5.5"
  gem "faker"
  gem "random_data", "1.5.1"
  gem "mocha", "0.9.8"
  gem "factory_girl_rails"
  gem 'cucumber-rails', '1.2.0'
  gem 'capybara', '1.1.2'
  gem "database_cleaner"
  gem "pickle"
  gem "launchy"
  gem "rspec-rails"
  gem "email_spec"
  gem "selenium-webdriver"
end

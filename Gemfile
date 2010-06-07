source :gemcutter
source "http://gems.github.com"

gem "rails", "2.3.5"
gem "configatron"
gem "sprockets"
gem "ruby-debug"
gem "eventmachine"
gem "tmm1-amqp"
gem "json"
gem "sqlite3-ruby"
gem "daemons"
gem "ruby-net-ldap"
gem "rmagick", ">=2.12.2"
gem "rack"
gem "fleximage", :git => "git://github.com/dudemeister/fleximage.git"
gem "capistrano"
gem "capistrano-ext"

group :production do
  gem "passenger"
end

group :test do
  gem "jeremymcanally-context"
  gem "faker"
  gem "random_data"
  gem "mocha"
  gem "factory_girl"
end

group :cucumber do
  gem "cucumber"
  gem "cucumber-rails"
  gem "capybara"
  gem "database_cleaner"
  gem "pickle"
end

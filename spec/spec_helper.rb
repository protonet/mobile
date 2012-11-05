require 'bundler'
ENV['RACK_ENV'] = "test"

require File.expand_path(File.dirname(__FILE__) + "/../config/environment")

require 'capybara'
require 'capybara/dsl'

Capybara.register_driver :webkit do |app|
  Capybara::Driver::Webkit.new(app, :stdout => nil)
end

Capybara.app               = MobileProtonet
Capybara.current_driver    = :webkit
Capybara.app_host          = 'http://localhost:9393'
Capybara.run_server        = false
Capybara.javascript_driver = :webkit

RSpec.configure do |conf|
  conf.include Rack::Test::Methods
  conf.include Capybara::DSL
end


# Helpers

def sign_out
  visit "/mobile/sign_out"
end

def sign_in user, pass
  sign_out
  visit "/mobile/sign_in"
  within '#login_form' do
    fill_in "user_login", :with =>  user
    fill_in "user_password", :with => pass
    click_button 'Login'
  end
end

def wait_for_channel_list
  wait_until{
    page.has_selector?('.channel-link')
  }
end
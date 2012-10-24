require 'bundler'
Bundler.require
require './app'

Sinatra::Sprockets.configure do |config|
  config.app = MobileProtonet
  
  ['javascripts', 'stylesheets', 'images'].each do |dir|
    config.append_path(File.join('..', 'assets', dir))
  end
  
  config.digest = false
  config.compress = ENV['RACK_ENV'] === 'production'
  config.debug = false
  config.compile = ENV['RACK_ENV'] === 'production'
  config.prefix = "mobile/assets"

  config.precompile = ['application.js', 'authentication.js', 'layout.css']
end
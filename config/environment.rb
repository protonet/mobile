require 'bundler'
Bundler.require
require './app'

Sinatra::Sprockets.configure do |config|
  config.app = MobileProtonet
  
  ['javascripts', 'stylesheets', 'images'].each do |dir|
    config.append_path(File.join('..', 'assets', dir))
  end
  
  config.digest = true
  config.compress = ENV['RACK_ENV'] === 'production' || ENV['COMPRESS_ASSETS'] === 'true'
  config.debug = false
  config.compile = true

  config.precompile = ['application.js', 'layout.css']
end
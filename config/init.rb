# Go to http://wiki.merbivore.com/pages/init-rb

Merb.push_path(:lib, Merb.root / "lib") # uses **/*.rb as path glob.
 
require 'config/dependencies.rb'
 
use_orm :datamapper
use_test :rspec
use_template_engine :erb
 
Merb::Config.use do |c|
  c[:use_mutex] = false
  c[:session_store] = 'cookie'  # can also be 'memory', 'memcache', 'container', 'datamapper
  
  # cookie session store configuration
  c[:session_secret_key]  = '6700df2970af5a8ec47c50cbfba8aa918b796ab2'  # required for cookie session store
  c[:session_id_key] = '_dashboard-new_session_id' # cookie session id key, defaults to "_session_id"
end
 
Merb::BootLoader.before_app_loads do
  # This will get executed after dependencies have been loaded but before your app's classes have loaded.
end
 
Merb::BootLoader.after_app_loads do
  # This will get executed after your app's classes have been loaded.
  
  # take configuration or default backend
  BackendAdapters::Ubuntu.new
  Backend.backend_connection = BackendAdapters.const_get((Merb::Config[:backend_adapter] ||= :development_mock).to_s.to_const_string).new
  Merb.logger.info("Backend '#{Backend.backend_connection.info}' connected successfully!")
  
end

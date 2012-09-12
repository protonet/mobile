require File.expand_path(File.join(*%w[ config environment ]), File.dirname(__FILE__))

map '/assets' do
  run Sinatra::Sprockets.environment
end

run MobileProtonet.new


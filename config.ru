require File.expand_path(File.join(*%w[ config environment ]), File.dirname(__FILE__))

map '/mobile/assets' do
  run Sinatra::Sprockets.environment
end

disable :run

FileUtils.mkdir_p 'log' unless File.exists?('log')
log = File.new("log/sinatra.log", "a")
$stdout.reopen(log)
$stderr.reopen(log)

run MobileProtonet.new


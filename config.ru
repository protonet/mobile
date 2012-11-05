require File.expand_path(File.join(*%w[ config environment ]), File.dirname(__FILE__))

if ENV['RACK_ENV'] === 'production'
  map '/assets' do
    run Sinatra::Sprockets.environment
  end
  run MobileProtonet.new

  FileUtils.mkdir_p 'log' unless File.exists?('log')
  log = File.new("log/#{ENV['RACK_ENV']}.log", "a")
  $stdout.reopen(log)
  $stdout.sync = true
  $stderr.reopen(log)
  $stderr.sync = true

else
  map '/mobile/assets' do
    run Sinatra::Sprockets.environment
  end
  map '/mobile' do
    run MobileProtonet.new
  end
end





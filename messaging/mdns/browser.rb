require 'rubygems'
require 'timeout'
require 'dnssd'

foobar = DNSSD::Service.new
begin
  Timeout::timeout(6) do
    foobar.browse '_afpovertcp._tcp' do |r|
      puts "Found HTTP service: #{r.name}"
    end
  end
rescue Timeout::Error
  'end'
end

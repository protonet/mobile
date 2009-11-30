require 'rubygems'
require 'dnssd'

register_service =
  DNSSD.register("protonet", "_protonet._tcp", nil, 12345) do
    puts "* Registered protonet node!"
  end

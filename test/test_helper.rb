puts 'loading helper'
$TESTING=true
require 'rubygems'
require 'merb-core'
require 'context'

# TODO: Boot Merb, via the Test Rack adapter
Merb.start :environment => (ENV['MERB_ENV'] || 'test'),
           :merb_root  => File.join(File.dirname(__FILE__), ".." )


class Test::Unit::TestCase
  # include Merb::Test::RequestHelper
  include Merb::Test::RouteHelper
  # Add more helper methods to be used by all tests here...
end

require File.dirname(__FILE__) + '/test_helpers/controller_asserts'

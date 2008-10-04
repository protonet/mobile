require 'rubygems'
require 'merb-core'
require 'spec' # Satisfies Autotest and anyone else not using the Rake tasks

Merb.push_path(:lib, Merb.root / "dashboard/lib")

# this loads all plugins required in your init file so don't add them
# here again, Merb will do it for you
Merb.start_environment(:testing => true, :adapter => 'runner', :environment => ENV['MERB_ENV'] || 'test')
module Merb
  module Test
    module ControllerHelper
      def running(&blk) blk; end

      def executing(&blk) blk; end

      def doing(&blk) blk; end

      def calling(&blk) blk; end
    end
  end
end

Spec::Runner.configure do |config|
  config.include(Merb::Test::ViewHelper)
  config.include(Merb::Test::RouteHelper)
  config.include(Merb::Test::ControllerHelper)
end

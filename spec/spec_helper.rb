require "rubygems"

# Add the local gems dir if found within the app root; any dependencies loaded
# hereafter will try to load from the local gems before loading system gems.
if (local_gem_dir = File.join(File.dirname(__FILE__), '..', 'gems')) && $BUNDLE.nil?
  $BUNDLE = true; Gem.clear_paths; Gem.path.unshift(local_gem_dir)
end

require "merb-core"
require "spec" # Satisfies Autotest and anyone else not using the Rake tasks

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

require(Merb.root + '/spec/factory.rb')

def assert(foo)
  !!foo
end

def assert_equal(a, b)
  b.should == a
end

def assert_not_equal(a, b)
  b.should_not == a
end

def assert_not_nil(a)
  a.should_not == nil
end

def assert_nil(a)
  a.should == nil
end

def assert_redirected_to(response, url, message =nil)
  response.should redirect_to(url, message)
end

def assert_not_redirected(foo)
  foo.should_not redirect
end

def assert_raises(&blk)
  blk.should raise_error
end

def assert_nothing_raised(&blk)
  blk.should_not raise_error
end

def assert_response(code, response)
  case code
  when :ok
    response.should be_successful
  end
end
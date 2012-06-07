require 'test_helper'

class RoutingTest < ActionController::TestCase

  test "should correctly route vpn on off stuff" do
    opts = {:controller => "preferences/vpn", :action => "on"}
    assert_routing "preferences/vpn/on", opts
    opts = {:controller => "preferences/vpn", :action => "off"}
    assert_routing "preferences/vpn/off", opts
  end

end

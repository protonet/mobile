require File.dirname(__FILE__) + '/../test_helper'

class RoutingTest < ActionController::TestCase

  test "should correctly route vpn on off stuff" do
    opts = {:controller => "system/vpn", :action => "on"}
    assert_routing "system/vpn/on", opts
    opts = {:controller => "system/vpn", :action => "off"}
    assert_routing "system/vpn/off", opts
  end
  
  test "should correctly route file directory creation" do
    assert_recognizes({:controller => 'system/files', :action => 'create_directory'}, {:path => 'system/files/create_directory', :method => :post})
  end
  

end

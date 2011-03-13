require File.dirname(__FILE__) + '/../test_helper'

class NetworkTest < ActiveSupport::TestCase
  test "the local method returns your local network (defined by the id 0)" do
    assert_equal 1, Network.local.id
  end
  
  test "the local method creates the local network if it doesn't exist" do
    assert Network.where(:id => 1).empty?
    Network.local
    assert !Network.where(:id => 1).empty?
  end
end

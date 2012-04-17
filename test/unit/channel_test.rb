require 'test_helper'

class ChannelTest < ActiveSupport::TestCase

  test "the home method should return the channel with the id 1" do
    assert_equal 1, Channel.home.id
  end
  
  test "normalize_name should normalize names" do
    assert_equal "alis-s-bam-bam", Channel.new(:name => "Alis's Bam bam").normalize_name
  end
  
  test "the locally_hosted? method should return true on local channels" do
    assert Channel.new(:node_id => 1).locally_hosted?
    assert !Channel.new(:node_id => 2).locally_hosted?
  end

end

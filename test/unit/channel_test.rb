require File.dirname(__FILE__) + '/../test_helper'

class ChannelTest < ActiveSupport::TestCase

  test "the home method should return the channel with the id 1" do
    assert_equal 1, Channel.home.id
  end
  
  test "normalize_name should normalize names" do
    assert_equal "alis-s-bam-bam", Channel.new(:name => "Alis's Bam bäm").normalize_name
  end

end

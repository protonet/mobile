require File.dirname(__FILE__) + '/../test_helper'

class ChannelTest < ActiveSupport::TestCase

  test "the home method should return the channel with the id 1" do
    assert_equal 1, Channel.home.id
  end
  
  test "name foo" do
    puts clean_diactritic_marks("Alis's Bam bäm")
  end

end

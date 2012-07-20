require 'test_helper'

class DelayedJobTest < ActiveSupport::TestCase
  
  setup do
    DelayedJob.create(:command => "Date")
  end
  
  should "delete job when processed" do
    assert_difference 'DelayedJob.count', -1 do
      DelayedJob.process
    end
  end
  
end

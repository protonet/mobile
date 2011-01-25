require 'test_helper'

class InvitationTest < ActiveSupport::TestCase
  setup do
    @invitation = Invitation.new
  end
  
  test "validation should require token" do
    assert !@invitation.valid?
    assert @invitation.errors.on(:token)
  end
end

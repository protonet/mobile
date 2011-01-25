require 'test_helper'

class InvitationTest < ActiveSupport::TestCase
  
  test "validation should create token" do
    @invitation = Invitation.new
    assert @invitation.token.nil?
    assert !@invitation.valid?
    assert @invitation.token
  end
  
end

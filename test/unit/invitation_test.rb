require 'test_helper'

class InvitationTest < Test::Unit::TestCase
  before do
    @invitation = Invitation.new
  end
  
  context "validation" do
    
    it "should ensure there is a token" do
      @invitation.valid?
      assert !@invitation.token.nil?
    end
    
    it "should require at least one channel id" do
      assert !@invitation.valid?
      assert @invitation.errors[:channel_ids]
    end
    
    it "should require a valid email address" do
      @invitation.email = "test"
      assert !@invitation.valid?
      assert @invitation.errors[:email]
      @invitation.email = "test@test"
      assert !@invitation.valid?
      assert @invitation.errors[:email]
      @invitation.email = "test@test.com"
      @invitation.valid?
      assert !@invitation.errors[:email]
    end
    
  end
  
end

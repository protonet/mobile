require 'test_helper'

class InvitationTest < Test::Unit::TestCase
  
  context "validation" do
    
    setup do
      @invitation = Invitation.new(:email => "test@mail.de")
    end
    
    should "ensure there is a token" do
      @invitation.valid?
      assert !@invitation.token.nil?
    end
    
    should "should require at least one channel id" do
      assert !@invitation.valid?
      assert @invitation.errors[:channel_ids]
    end
    
    should "should require a valid email address" do
      @invitation.email = "test"
      assert !@invitation.valid?
      assert @invitation.errors[:email].any?
      @invitation.email = "test@test"
      assert !@invitation.valid?
      assert @invitation.errors[:email].any?
      @invitation.email = "test@test.com"
      @invitation.valid?
      assert @invitation.errors[:email].empty?
    end
    
  end
  
end

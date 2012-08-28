require 'test_helper'

class NotificationTest < ActiveSupport::TestCase
  
  setup do
    Role.find_or_create_by_title("user")
    Role.find_or_create_by_title("guest")
    node = Node.local
    @online_user = FactoryGirl.create(:user)
    @offline_user = FactoryGirl.create(:user)
    @channel = Channel.first
    @online_user.subscribe(@channel)
    @offline_user.subscribe(@channel)
    @private_channel = Channel.setup_rendezvous_for(@online_user.id, @offline_user.id)
  end

  context "delete notification if user deletes the meep" do
    setup do
      @meep = Meep.create(:channel => @channel, :user => @online_user, :message => "hello @#{@offline_user.login}") 
    end

    should "delete" do
      assert_difference "Notification.count", -1 do
        @meep.destroy
      end
    end

  end
    
  context "notify about private message" do
    
    setup do
      Meep.create(:channel => @private_channel, :user => @online_user, :message => "hello @#{@offline_user.login}") 
    end

    should "create a private_message notification" do
      assert_equal 1, Notification.where(
        :event_type => "private_message", 
        :subject_id => @offline_user.id,
        :subject_type => "User",
        :actor_id => @online_user.id,
        :actor_type => "User"   
      ).count
    end
    
    should "enque a delayed job" do
      assert_equal 1, DelayedJob.count
    end
    
  end
  
  context "notify about @reply" do
    
    setup do
      Meep.create(:channel => @channel, :user => @online_user, :message => "hello @#{@offline_user.login}")
    end
    
    should "create a @reply notification" do
      assert_equal 1, Notification.where(
        :event_type => "atreply", 
        :subject_id => @offline_user.id,
        :subject_type => "User",
        :actor_id => @online_user.id,
        :actor_type => "User"   
      ).count
    end
    
    should "enque a delayed job" do
      assert_equal 1, DelayedJob.count
    end
    
  end
  
end

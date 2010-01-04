require File.dirname(__FILE__) + '/../test_helper'

class UserTest < Test::Unit::TestCase
  
  context "Removing old temporary users also called strangers" do
    it "should remove all strangers created prior to 2 days ago" do
      User.stranger('session_id1').update_attributes(:created_at => Time.now - 1.days)
      User.stranger('session_id2').update_attributes(:created_at => Time.now - 2.days)
      User.stranger('session_id3').update_attributes(:created_at => Time.now - 3.days)
      assert User.all_strangers
      # destroy all strangers
      User.destroy_all({:temporary_identifier => 'IS NOT NULL'})
    end
  end
  
  context "Creating a stranger user" do
    
    it "should succeed" do
      assert_not_nil User.stranger('session_id')
    end
    
    it "should set the given session id as its temporary identifier" do
      user = User.stranger('session_id')
      assert_equal 'session_id', user.temporary_identifier
    end
    
    it "should set a name based on the given session id" do
      user = User.stranger('1234567890123')
      assert_equal 'stranger_number_1234567890', user.name      
    end
    
    it "should be recognizable as one" do
      user = User.stranger('foobar')
      assert user.stranger?
    end
    
    it "should add it as a listener of the home channel" do
      user = User.stranger('foobar')
      assert_equal user.channels, [Channel.home]
    end
    
    it "should not create an ldap user" do
      Ldap::User.expects(:create_for_user).never
      User.stranger('foobar')
    end
    
  end
  
  context "Getting a communication authentication token" do
    
    before do
      Ldap::User.stubs(:create_for_user)
    end
      
    should "be possible" do
      user = User.make
      assert_not_nil user.communication_token
    end
    
    should "validate a correct token" do
      user = User.make
      assert user.communication_token_valid?(user.communication_token)
    end
    
    should "not validate an incorrect token" do
      user = User.make
      assert !user.communication_token_valid?('test')
    end
    
    should "not validate an expired token" do
      user = User.make
      token = user.communication_token
      user.communication_token_expires_at = Time.now - 1.day
      assert !user.communication_token_valid?(token)
    end

    should "recreate a token if it is expired" do
      user = User.make
      token = user.communication_token
      user.communication_token_expires_at = Time.now - 1.day
      assert_not_equal token, user.communication_token
    end

    should "not recreate a token if it is not expired" do
      user = User.make
      token = user.communication_token
      assert_equal token, user.communication_token
    end
    
    context "for a stranger user" do

      should "also work" do
        user = User.stranger('foobarius')
        assert_not_nil user.communication_token
      end
      
      should "store the user in memcache using the given session id" do
        flunk
      end
      
      should "be validatable" do
        flunk
      end
      
    end

    
  end
  
  context "in general" do
    it "should have a display name" do
      flunk
    end
  end
  
end

class UserAuthAndCreationTest < ActiveSupport::TestCase
  # Be sure to include AuthenticatedTestHelper in test/test_helper.rb instead.
  # Then, you can remove it from this and the functional test.
  include AuthenticatedTestHelper
  fixtures :users

  context "creating a user" do

    should "succeed" do
      assert_difference 'User.count' do
        user = create_user
        assert !user.new_record?, "#{user.errors.full_messages.to_sentence}"
      end
    end

    should "require a login" do
      assert_no_difference 'User.count' do
        u = create_user(:login => nil)
        assert u.errors.on(:login)
      end
    end

    should "require a password" do
      assert_no_difference 'User.count' do
        u = create_user(:password => nil)
        assert u.errors.on(:password)
      end      
    end
    
    should "require password confirmation" do
      assert_no_difference 'User.count' do
        u = create_user(:password_confirmation => nil)
        assert u.errors.on(:password_confirmation)
      end      
    end
    
    should "create the ldap user" do
      user = User.make_unsaved
      Ldap::User.expects(:create_for_user).with(user)
      user.save
    end

  end
  
  context "authentication" do
    should "reset password" do
      users(:quentin).update_attributes(:password => 'new password', :password_confirmation => 'new password')
      assert_equal users(:quentin), User.authenticate('quentin', 'new password')      
    end
    
    should "not rehash password" do
      users(:quentin).update_attributes(:login => 'quentin2')
      assert_equal users(:quentin), User.authenticate('quentin2', 'monkey')
    end
    
    should "authenticate user" do
      assert_equal users(:quentin), User.authenticate('quentin', 'monkey')
    end
    
    should "set remember me token" do
      users(:quentin).remember_me
      assert_not_nil users(:quentin).remember_token
      assert_not_nil users(:quentin).remember_token_expires_at
    end
    
    should "unset remember me token" do
      users(:quentin).remember_me
      assert_not_nil users(:quentin).remember_token
      users(:quentin).forget_me
      assert_nil users(:quentin).remember_token
    end
    
    should "remember me for one week" do
      before = 1.week.from_now.utc
      users(:quentin).remember_me_for 1.week
      after = 1.week.from_now.utc
      assert_not_nil users(:quentin).remember_token
      assert_not_nil users(:quentin).remember_token_expires_at
      assert users(:quentin).remember_token_expires_at.between?(before, after)
    end
    
    should "remember me until one week" do
      time = 1.week.from_now.utc
      users(:quentin).remember_me_until time
      assert_not_nil users(:quentin).remember_token
      assert_not_nil users(:quentin).remember_token_expires_at
      assert_equal users(:quentin).remember_token_expires_at, time      
    end
    
    should "remember me default two weeks" do
      before = 2.weeks.from_now.utc
      users(:quentin).remember_me
      after = 2.weeks.from_now.utc
      assert_not_nil users(:quentin).remember_token
      assert_not_nil users(:quentin).remember_token_expires_at
      assert users(:quentin).remember_token_expires_at.between?(before, after)
    end
  end

protected
  def create_user(options = {})
    Ldap::User.stubs(:create_for_user)
    record = User.new({ :login => 'quire', :email => 'quire@example.com', :password => 'quire69', :password_confirmation => 'quire69' }.merge(options))
    record.save
    record
  end
end

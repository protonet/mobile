require File.dirname(__FILE__) + '/../test_helper'

class UserTest < ActiveSupport::TestCase
  
  context "Creating a coward user" do
    
    it "should succeed" do
      assert_not_nil User.coward('session_id')
    end
    
    it "should set the given session id as an instance variable" do
      user = User.coward('session_id')
      assert_equal 'session_id', user.session_id
    end
    
    it "should set a name based on the given session id" do
      user = User.coward('1234567890123')
      assert_equal 'coward_number_1234567890', user.name      
    end
    
    it "should set the user to 0" do
      user = User.coward('foobar')
      assert_equal 0, user.id
    end
    
    it "should add it as a listener of the home audience" do
      user = User.coward('foobar')
      assert_equal user.audiences, [Audience.home]
    end
    
  end
  
  context "Getting a communication authentication token" do
        
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
    
    should "also work for an coward user" do
      user = User.coward('foobarius')
      assert_not_nil user.communication_token
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
    record = User.new({ :login => 'quire', :email => 'quire@example.com', :password => 'quire69', :password_confirmation => 'quire69' }.merge(options))
    record.save
    record
  end
end

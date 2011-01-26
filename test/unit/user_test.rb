require File.dirname(__FILE__) + '/../test_helper'

class UserTest < Test::Unit::TestCase
  
  before do
    Role.find_or_create_by_title("user")
  end
  
  context "Calling the class method anonymous" do
    it "should return an user with the id 0" do
      assert_equal 0, User.anonymous.id
    end
    
    it "should create an entry for the anonymous user if it doesn't exist" do
      User.delete_all
      assert User.all([0]).empty?
      User.anonymous
      assert !User.all([0]).empty?
    end
    
  end
  
  context "Removing old temporary users also called strangers" do
    it "should remove all strangers created prior to 2 days ago" do
      User.destroy_all
      (2..4).each do |i|
        user = User.stranger("session_id_#{i}")
        User.update_all("updated_at = '#{(Time.now - i.days).to_s(:db)}'", "id = #{user.id}")
      end
      assert_equal 3, User.all_strangers.size
      User.delete_strangers_older_than_two_days!
      assert_equal 1, User.all_strangers.size
      assert User.all_strangers.first.updated_at > Time.now - 2.days
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
      assert_equal 'stranger_1234567890', user.name
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
      @user = Factory.build(:user)
    end
      
    should "be possible" do
      assert_not_nil @user.communication_token
    end
    
    should "validate a correct token" do
      assert @user.communication_token_valid?(@user.communication_token)
    end
    
    should "not validate an incorrect token" do
      assert !@user.communication_token_valid?('test')
    end
    
    should "not validate an expired token" do
      token = @user.communication_token
      @user.communication_token_expires_at = Time.now - 1.day
      assert !@user.communication_token_valid?(token)
    end

    should "recreate a token if it is expired" do
      token = @user.communication_token
      @user.communication_token_expires_at = Time.now - 1.day
      assert_not_equal token, @user.communication_token
    end

    should "not recreate a token if it is not expired" do
      token = @user.communication_token
      assert_equal token, @user.communication_token
    end
    
    context "for a stranger user" do

      should "also work" do
        user = User.stranger('foobarius')
        assert_not_nil user.communication_token
      end
    
    end
  end
  
  context "in general" do
    it "should have his login as a display name if no name is set" do
      user = Factory.build(:user, {:login => 'ali'})
      assert_equal 'ali', user.display_name
    end
  end
  
end

# test: destroy listens if the user has been deleted
# test: nullify ownership on channels but don't delete them
# test: destroy avatars on user deletion
# test: handle tweet stuff when deleting user
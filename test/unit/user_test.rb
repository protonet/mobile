require 'test_helper'

class UserTest < ActiveSupport::TestCase
  
  setup do
    Role.find_or_create_by_title("user")
    Role.find_or_create_by_title("guest")
  end
  
  context "test" do 
    
  
    context "Calling the class method anonymous" do
      should "should return an user with the id 0" do
        assert_equal(-1, User.anonymous.id)
      end
    
      should "should create an entry for the anonymous user if should doesn't exist" do
        User.delete_all
        assert User.where(:id => -1).empty?
        User.anonymous
        assert !User.where(:id => -1).empty?
      end
    
    end
  
    context "Removing old temporary users also called strangers" do
      should "should remove all strangers created prior to 2 days ago" do
        User.destroy_all
        (2..4).each do |i|
          user = User.stranger("#{i}_session_id")
          User.update_all("updated_at = '#{(Time.now - i.days).to_s(:db)}'", "id = #{user.id}")
        end
        assert_equal 3, User.all_strangers.size
        User.delete_strangers_older_than_two_days!
        assert_equal 1, User.all_strangers.size
        assert User.all_strangers.first.updated_at > Time.now - 2.days
      end
    end
  
    context "Creating a stranger user" do
    
      should "should succeed" do
        assert_not_nil User.stranger('session_id')
      end
    
      should "should set the given session id as its temporary identifier" do
        user = User.stranger('session_id')
        assert_equal 'session_id', user.temporary_identifier
      end
    
      should "should set a name based on the given session id" do
        user = User.stranger('1234567890123')
        assert_equal 'guest.12345', user.login
      end
    
      should "should be recognizable as one" do
        user = User.stranger('foobar')
        assert user.stranger?
      end
    
      should "should add should as a listener of the home channel" do
        user = User.stranger('foobar')
        assert_equal user.channels, [Channel.home]
      end
    
      should "should not create an ldap user" do
        LdapUser.expects(:create_for_user).never
        User.stranger('foobar')
      end
    
    end
  
    context "Getting a communication authentication token" do
    
      setup do
        LdapUser.stubs(:create_for_user)
        @user = FactoryGirl.create(:user)
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

      should "recreate a token if should is expired" do
        token = @user.communication_token
        @user.communication_token_expires_at = Time.now - 1.day
        assert_not_equal token, @user.communication_token
      end

      should "not recreate a token if should is not expired" do
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
      should "should have his login as a display name if no name is set" do
        user = FactoryGirl.build(:user, {:login => 'ali'})
        assert_equal 'ali', user.display_name
      end
    end
  
    context "generate_login_from_name" do
      setup do
        FactoryGirl.create(:user, {:login => "test.user"})
        FactoryGirl.create(:user, {:login => "test.user2"})
      end 
      should "should generate next available login" do
        assert_equal "test.user3", User.new(:first_name => "Test", :last_name => "User").generate_login_from_name
      end
    end
  end
  
  context "save last_seen date" do
    setup do
      @user = FactoryGirl.create(:user)
    end
    
    should "set last_seen to now as default" do
      assert_not_nil @user.last_seen, "last_seen should be nil"
    end
    
    should "set last_seen to nil when user turned online" do
      assert @user.save_online_status
      @user.reload
      assert_equal nil, @user.last_seen
    end
    
    should "set last_seen to new when user turned offline" do
      now = Time.now
      Time.stubs(:now).returns(now.utc)
      assert @user.save_offline_status
      @user.reload
      assert_equal now.to_s(:db), @user.last_seen.to_s(:db)
      Mocha::Mockery.instance.stubba.unstub_all
    end
  end
  
end

# test: destroy listens if the user has been deleted
# test: nullify ownership on channels but don't delete them
# test: destroy avatars on user deletion
# test: handle meep stuff when deleting user
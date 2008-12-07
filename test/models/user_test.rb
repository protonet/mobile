require File.join(File.dirname(__FILE__), '..', "test_helper")

class UserTest < Test::Unit::TestCase

  context "A user basically" do

    before do
      User.all.destroy!
      @user = User.new
    end

    test "should have certain attributes to be valid" do
      assert !@user.valid?
      @user.attributes = {:login => 'fooo', :password => 'foo'}
      assert @user.valid?
    end

    test "should have certain attributes to be valid when being created" do
      @user.attributes = {:login => 'fooo', :password => 'foo'}
      assert !@user.valid?(:create)
      @user.attributes = {:login => 'fooo', :password => 'foo', :password_confirmation => 'bar'}
      assert !@user.valid?(:create)
      @user.attributes = {:login => 'fooo', :password => 'fooo', :password_confirmation => 'fooo'}
      assert @user.valid?(:create)
    end

    test "should downcase your login before creation of your user" do
      @user.login = 'FoOBar'
      assert @user.save
      assert_equal 'foobar', @user.login
    end

    test "should check that you confirm your password on password changes" do
    end

    test "should encrypt the given password before saving it" do
      @user.attributes = {:login => 'fooo', :password => 'foo'}
      @user.save
      assert @user.crypted_password != 'foo'
    end

  end

  context "User authentication" do

    before do
      User.all.destroy!
      @user = User.new(:login => 'foo', :password => 'blub')
      assert @user.save
    end

    test "should allow basic authentication with the correct login and password" do
      assert_not_nil User.authenticate({:login => 'foo', :password => 'blub'})
    end

    test "should return the authenticated user when successful" do
      assert_equal @user, User.authenticate({:login => 'foo', :password => 'blub'})
    end

    test "should fail authentication when login or pass is incorrect by returning nil" do
      assert_nil User.authenticate({:login => 'foo', :password => ''})
      assert_nil User.authenticate({:login => '', :password => 'blub'})
      assert_nil User.authenticate({:login => 'foo1', :password => 'bla'})
    end
  end
end

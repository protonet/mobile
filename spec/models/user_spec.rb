require File.join( File.dirname(__FILE__), '..', "spec_helper" )

describe User, "basically" do

  before(:each) do
    User.all.destroy!
    @user = User.new    
  end
  
  it "should have certain attributes to be valid" do
    assert !@user.valid?
    @user.attributes = {:login => 'fooo', :password => 'foo'}
    assert @user.valid?
  end
  
  it "should have certain attributes to be valid when being created" do
    @user.attributes = {:login => 'fooo', :password => 'foo'}
    assert !@user.valid?(:create)
    @user.attributes = {:login => 'fooo', :password => 'foo', :password_confirmation => 'bar'}
    assert !@user.valid?(:create)
    @user.attributes = {:login => 'fooo', :password => 'fooo', :password_confirmation => 'fooo'}
    assert @user.valid?(:create)
  end
  
  it "should downcase your login before creation of your user" do
    @user.login = 'FoOBar'
    assert @user.save
    assert_equal 'foobar', @user.login
  end
  
  it "should check that you confirm your password on password changes" do
    pending
  end
  
  it "should encrypt the given password before saving it" do
    @user.attributes = {:login => 'fooo', :password => 'foo'}
    @user.save
    assert_not_equal 'foo', @user.crypted_password
  end
  
end


describe User, "authentication" do
  
  before(:all) do
    User.all.destroy!
    @user = User.new(:login => 'foo', :password => 'blub')
    assert @user.save
  end
  
  it "should allow basic authentication with the correct login and password" do
    assert_not_nil User.authenticate({:login => 'foo', :password => 'blub'})
  end
  
  it "should return the authenticated user when successful" do
    assert_equal @user, User.authenticate({:login => 'foo', :password => 'blub'})
  end
  
  it "should fail authentication when login or pass is incorrect by returning nil" do
    assert_nil User.authenticate({:login => 'foo', :password => ''})
    assert_nil User.authenticate({:login => '', :password => 'blub'})
    assert_nil User.authenticate({:login => 'foo1', :password => 'bla'})
  end
end
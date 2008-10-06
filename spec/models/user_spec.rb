require File.join( File.dirname(__FILE__), '..', "spec_helper" )

describe User, "basically" do

  before(:each) do
    @user = User.new
  end
  
  it "should have certain attributes to be valid" do
    @user.valid?.should == false
    @user.attributes = {:login => 'fooo', :password => 'foo'}
    @user.valid?.should == true
  end
  
  it "should have certain attributes to be valid when being created" do
    @user.attributes = {:login => 'fooo', :password => 'foo'}
    @user.valid?(:create).should == false
    @user.attributes = {:login => 'fooo', :password => 'foo', :password_confirmation => 'bar'}
    @user.valid?(:create).should == false
    @user.attributes = {:login => 'fooo', :password => 'fooo', :password_confirmation => 'fooo'}
    @user.valid?(:create).should == true
  end
  
  it "should downcase your login before creation of your user" do
    @user.login = 'FoOBar'
    @user.save.should == true
    @user.login.should == 'foobar'
  end
  
  it "should check that you confirm your password on password changes" do
    pending
  end
  
  it "should encrypt the given password before saving it" do
    @user.attributes = {:login => 'fooo', :password => 'foo'}
    @user.save
    @user.crypted_password == 'bla'
  end
  
end


describe User, "authentication" do
  
  before(:all) do
    User.all.destroy!
    @user = User.new(:login => 'foo', :password => 'blub')
    @user.save.should == true
  end
  
  it "should allow basic authentication with the correct login and password" do
    User.authenticate({:login => 'foo', :password => 'blub'}).should_not == nil
  end
  
  it "should return the authenticated user when successful" do
    User.authenticate({:login => 'foo', :password => 'blub'}).should == @user
  end
  
  it "should fail authentication when login or pass is incorrect by returning nil" do
    User.authenticate({:login => 'foo', :password => ''}).should == nil
    User.authenticate({:login => '', :password => 'blub'}).should == nil
    User.authenticate({:login => 'foo1', :password => 'bla'}).should == nil
  end
end
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
  
  it "should be able to save the user after having requested a token" do
    @user.attributes = {:login => 'fooo', :password => 'foo'}
    @user.token
    assert @user.save
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

describe User, "token generation and validation" do
  
  before(:each) do
    @user = User.new(:login => 'foo', :password => 'blub')
  end
  
  it "should save the token when requesting it" do
    DateTime.should_receive(:now).any_number_of_times.and_return(DateTime.parse("2008-01-01 00:00:00"))
    @user.should_receive(:save)
    @user.token
  end
  
  it "should create a login token for the user" do
    DateTime.should_receive(:now).any_number_of_times.and_return(DateTime.parse("2008-01-01 00:00:00"))
    @user.token
    assert_equal "feaa605f8c1e80ff65f05e577b01078fce3069ac", @user.token
  end
  
  it "should set an expiry date for it one day in the future" do
    DateTime.should_receive(:now).any_number_of_times.and_return(DateTime.parse("2008-01-01 00:00:00"))
    @user.token
    assert_equal "2008-01-02T00:00:00+00:00", @user.token_expires_at.to_s
  end
  
  it "should be able to authenticate that token" do
    DateTime.should_receive(:now).any_number_of_times.and_return(DateTime.parse("2008-01-01 00:00:00"))
    @user.token
    assert @user.token_valid?("feaa605f8c1e80ff65f05e577b01078fce3069ac")
    assert !@user.token_valid?("feaa605f8c1e80f")
  end
  
  it "should say its invalid if its past its expiry date" do
    token = @user.token
    @user.token_expires_at = DateTime.now - 2
    assert @user.save!
    assert !@user.token_valid?(token)
  end

end

describe User, "chat functionality" do
  
  before do
    User.all.destroy!
    ChatRoom.all.destroy!
    @user = User.gen
    @room = ChatRoom.gen
  end
  
  it "should allow you to join and leave a room" do
    @user.join_room(@room)
    assert_equal @user.joined_rooms.reload, [@room]
    @user.leave_room(@room)
    assert_equal @user.joined_rooms.reload, []
  end
  
end

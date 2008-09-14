require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

# any controller that inherits from application.rb
class AnyController < Application
  
  def bar
    'foo'
  end
  
end

describe AnyController, "inheriting from Application" do

  it "should redirect to login with notice" do
    get(url(:controller => 'any_controller', :action => 'bar')).should redirect_to(url(:login), {:message => { :error => 'Bitte einloggen oder einen neuen User anlegen (kostenlos, keine Daten notwendig!).' }})
  end

end

# end of any controller tests

describe Application, "authentication methods" do
  
  before(:each) do
    @app = Application.new(fake_request)
    # also initialize session since we need it in these tests
    @app.request.session ={}
  end
  
  it "should tell you if the user is logged in" do
    @app.logged_in?.should == false
    @app.instance_variable_set(:@current_user, 'something')
    @app.logged_in?.should == true
  end
  
  it "should allow you to set a current user and store it in the session and return it too" do
    user = User.new(:id => 23)
    running {@app.current_user = user}.should_not raise_error
    @app.session[:user].should == user.id
    @app.current_user.should == user
  end
  
  # TODO following tests could be split up differently, will keep them as they are for now

  it "should be able to enforce a login on *login_required* and redirect you if you're not authorized" do
    @app.should_receive(:try_to_login).twice
    @app.should_receive(:logged_in?).and_return(true, false)
    # logged_in? returns true
    @app.login_required.should_not redirect
    # logged_in? returns false
    running {@app.login_required}.should raise_error # todo not completely correclty testes, dude wtfbbq?
  end
  
  it "should be able to try to log you in" do
    @app.should_receive(:login_from_session).and_return(User.new(:id => 1, :login => 'foo'), nil)
    @app.should_receive(:login_from_cookie).and_return(User.new(:id => 2, :login => 'bar'))
    @app.send(:try_to_login).id.should == 1
    @app.instance_variable_set(:@current_user, nil) # log out
    @app.send(:try_to_login).id.should == 2
  end
  
  it "should return the user from a session" do
    user = User.new(:id => 1)
    @app.session[:user] = user.id
    User.should_receive(:get).with(1).and_return(user)
    @app.send(:login_from_session).should == user
  end
  
  it "should return the user from a cookie" do
    pending
  end
  
  it "should log out the user" do
    user = User.new(:id => 1)
    @app.current_user = user
    @app.log_out!
    @app.send(:try_to_login)
    @app.logged_in?.should == false
  end
  
end


require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

# any controller that inherits from application.rb
class AnyController < Application
  
  def bar
    'foo'
  end
  
end

describe AnyController, "inheriting from Application" do

  it "should redirect to login with notice" do
    response = get(url(:controller => 'any_controller', :action => 'bar'))
    error_message = {:message => { :error => 'Bitte einloggen oder einen neuen User anlegen (kostenlos, keine Daten notwendig!).' }}
    assert_redirected_to response, url(:login), error_message
  end

end

# end of any controller tests

describe Application, "authentication methods" do
  
  before(:each) do
    @app = Application.new(fake_request)
    # also initialize session since we need it in these tests
  end
  
  it "should allow you to set a current user and store it in the session and return it too" do
    user = User.new(:id => 23)
    assert_nothing_raised { @app.current_user = user }
    assert_equal user.id, @app.session[:user]
    assert_equal user, @app.current_user
  end
  
  it "should call the users poll method with the current request ip on setting the current user" do
    user = User.new(:id => 24, :login => 'foo')
    @app.request.env['REMOTE_ADDR'] = '123.23.23.1'
    user.should_receive(:poll).with("123.23.23.1").once
    @app.current_user = user
  end

  it "should tell you if the user is logged in" do
    assert !@app.logged_in?
    @app.instance_variable_set(:@current_user, 'something')
    assert @app.logged_in?
  end  
  
  it "should log out the user and set or unset needed vars/attributes" do
    user = User.new(:id => 1, :login => 'foo')
    @app.current_user = user
    user.should_receive(:poll).with(nil, true)
    @app.log_out!
    assert_nil @app.session[:user]
    assert_nil @app.current_user
  end

  # todo another describe mebbe? yes but not now ;)
  # TODO following tests could be split up differently, will keep them as they are for now

  it "should be able to enforce a login on *login_required* and redirect you if you're not authorized" do
    @app.should_receive(:try_to_login).twice
    @app.should_receive(:logged_in?).and_return(true, false)
    # logged_in? returns true
    assert_not_redirected @app.login_required
    # logged_in? returns false
    assert_raises { @app.login_required } # todo not completely correclty testes, dude wtfbbq?
  end
  
  it "should be able to try to log you in from session first" do
    @app.should_receive(:login_from_session).and_return(User.new(:id => 1, :login => 'foo'), nil)
    @app.should_receive(:login_from_cookie).and_return(User.new(:id => 2, :login => 'bar'))
    assert_equal 1, @app.send(:try_to_login).id
    @app.instance_variable_set(:@current_user, nil) # log out
    assert_equal 2, @app.send(:try_to_login).id
  end
  
  # todo another describe maybe?
  
  it "should return the user from a session" do
    user = User.new(:id => 1)
    @app.session[:user] = user.id
    User.should_receive(:get).with(1).and_return(user)
    assert_equal user, @app.send(:login_from_session)
  end
  
  it "should return the user from a cookie" do
    pending
  end  
  
end


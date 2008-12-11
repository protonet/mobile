require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe Users, "basic methods" do
  
  before(:each) do
    @app = Users.new(fake_request)
  end
  
  it "should allow you a get on new and create action without redirection to the login page" do
    [:new, :create].each do |action|
      assert_not_redirected dispatch_to(Users, action)
    end
  end
  
  it "should render the new form with the logged out form" do
    @app.should_receive(:render).with(:new, :layout => "logged_out")
    @app.create
    @app.should_receive(:render)
    @app.new
  end

end

describe Users, "creation method" do
  
  before(:each) do
    User.all.destroy!
  end
  
  it "should allow you to create a user with basic data" do
    assert User.all.empty?
    post(url(:controller => 'users', :action => 'create'), :user => {:login => 'foo', :password => 'bars', :password_confirmation => 'bars'})
    assert_equal 1, User.all.size
    assert_equal 'foo', User.all[0].login
  end
  
  it "should call save with create scope to call correct validations" do
    user = User.new
    User.should_receive(:new).and_return(user)
    user.should_receive(:save).with(:create)
    # fixme ali remove the format when merb gets fixed
    post(url(:controller => 'users', :action => 'create', :format => 'html'), :user => {:login => 'foo', :password => 'bars'})
  end
  
  it "should render the new form if user creation failed" do
    assert User.all.empty?
    post(url(:controller => 'users', :action => 'create'), :user => {}) do |controller|
      controller.should_receive(:render).with(:new, :layout => "logged_out")
    end
    assert User.all.empty?
  end
  
  it "should show validation errors" do
    pending
  end
  
  it "should automatically log you in when you create a user" do
    user = User.new
    User.should_receive(:new).with('mocked').and_return(user)
    user.should_receive(:save).and_return(true)
    post(url(:controller => 'users', :action => 'create'), :user => 'mocked') do |controller|
      controller.should_receive(:current_user=).with(user)
    end
  end
  
end
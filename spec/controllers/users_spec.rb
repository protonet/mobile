require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe Users, "basic methods" do
  
  before(:each) do
    @app = Users.new(fake_request)
  end
  
  it "should allow you a get on new and create action without redirection to the login page" do
    [:new, :create].each {|action| dispatch_to(Users, action).should_not redirect}
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
    User.all.should be_empty # I hate rspec
    post(url(:controller => 'users', :action => 'create'), :user => {:login => 'foo', :password => 'bars', :password_confirmation => 'bars'})
    User.all.size == 1
    User.all[0].login == 'foo'
  end
  
  it "should call save with create scope to call correct validations" do
    user = User.new
    User.should_receive(:new).and_return(user)
    user.should_receive(:save).with(:create)
    post(url(:controller => 'users', :action => 'create'), :user => {:login => 'foo', :password => 'bars'})
  end
  
  it "should render the new form if user creation failed" do
    User.all.should be_empty # with a passion, why easy when it can be complicated
    post(url(:controller => 'users', :action => 'create'), :user => {}) do |controller|
      controller.should_receive(:render).with(:new, :layout => "logged_out")
    end
    User.all.should be_empty
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
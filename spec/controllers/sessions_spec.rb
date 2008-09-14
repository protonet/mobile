require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe Sessions, "methods" do
  
  before(:all) do
    User.all.destroy!
    @user = User.new(:login => 'foo', :password => 'blub', :password_confirmation => 'blub')
    @user.save.should == true
  end
  
  it "should allow you a get on new, create action without redirection to the login page" do
    [:new, :create].each {|action| dispatch_to(Sessions, action).should be_successful}
  end
  
  it "should allow you to destroy a session and the redirect you to the login page" do
    @app = Sessions.new(fake_request)
    @app.request.session = {}
    @app.current_user = @user
    @app.destroy
    @app.current_user.should == nil
  end
  
  it "should set the current user for your credentials" do
    get(url(:controller => 'sessions', :action => 'create'), :user => {:login => 'foo', :password => 'blub'}) do |controller|
      controller.should_receive(:current_user=).with(@user)
    end
  end
  
  it "should allow redirect to the home page if you've logged in successfully" do
    get(url(:controller => 'sessions', :action => 'create'), :user => {:login => 'foo', :password => 'blub'}).should redirect_to(url(:home))
  end
  
  it "should render :new if you could not be logged in" do
    get(url(:controller => 'sessions', :action => 'create')) do |controller|
      controller.should_receive(:logged_in?).and_return(false)
      controller.should_receive(:render).with(:new)
    end
  end
  
  it "should display an error message if login failed" do
    
  end
    
  # frak
end
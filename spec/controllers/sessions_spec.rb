require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe Sessions, "methods" do
  
  before(:all) do
    User.all.destroy!
    @user = User.new(:login => 'foo', :password => 'blub', :password_confirmation => 'blub')
    @user.save(:create).should == true
  end
  
  it "should allow you a get on create action without redirection" do
    [:create].each {|action| dispatch_to(Sessions, action).should be_successful}
  end
    
  it "should set the currently connected users as an instance var on new" do
    test_users = [mock(1, :display_name => 1),mock(2, :display_name => 2)]
    User.should_receive(:all_connected_users).once.and_return(test_users)
    get(url(:controller => 'sessions', :action => 'create')).assigns(:connected_users).should == test_users
  end
  
  it "should be successful on a get on create" do
    get(url(:controller => 'sessions', :action => 'create')).should be_successful
  end
  
  it "should display the login form on a get on create" do
    pending
  end
  
  it "should set the current user for your credentials" do
    post(url(:controller => 'sessions', :action => 'create'), :user => {:login => 'foo', :password => 'blub'}) do |controller|
      controller.should_receive(:current_user=).with(@user)
    end
  end
  
  it "should allow redirect to the home page if you've logged in successfully" do
    post(url(:controller => 'sessions', :action => 'create'), :user => {:login => 'foo', :password => 'blub'}).should redirect_to(url(:home))
  end
  
  it "should allow you to destroy a session and the redirect you to the login page" do
    post(url(:controller => 'sessions', :action => 'destroy'), :user => {:login => 'foo', :password => 'blub'}) do |controller|
      controller.should_receive(:login_required)
      controller.should_receive(:log_out!)
    end.should redirect_to(url(:login))
  end
  
  it "should redirect to :new if you could not be logged in and display a message" do
    post(url(:controller => 'sessions', :action => 'create')) do |controller|
      controller.should_receive(:logged_in?).and_return(false)
    end.should redirect_to(url(:login), :message => {:error => 'Login oder Passwort falsch!'})
  end
  
  # frak
end
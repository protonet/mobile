require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe Sessions, "methods" do
  
  before(:all) do
    User.all.destroy!
    @user = User.new(:login => 'foo', :password => 'blub', :password_confirmation => 'blub')
    @user.save(:create).should == true
  end
  
  it "should allow you a get on create action without redirection" do
    [:create].each do |action|
      assert_response :ok, dispatch_to(Sessions, action)
    end
  end
    
  it "should set the currently connected users as an instance var on new" do
    test_users = [mock(1, :display_name => 1),mock(2, :display_name => 2)]
    User.should_receive(:all_connected_users).once.and_return(test_users)
    response = get(url(:controller => 'sessions', :action => 'create'))
    assert_equal test_users, response.assigns(:connected_users)
  end
  
  it "should be successful on a get on create" do
    assert_response :ok, get(url(:controller => 'sessions', :action => 'create'))
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
    response = post(url(:controller => 'sessions', :action => 'create'),:user => {:login => 'foo', :password => 'blub'})
    assert_redirected_to response, url(:home)
  end
  
  it "should allow you to destroy a session and the redirect you to the login page" do
    response = post(url(:controller => 'sessions', :action => 'destroy'), :user => {:login => 'foo', :password => 'blub'}) do |controller|
      controller.should_receive(:login_required)
      controller.should_receive(:log_out!)
    end
    assert_redirected_to response, url(:login)
  end
  
  it "should redirect to :new if you could not be logged in and display a message" do
    response = post(url(:controller => 'sessions', :action => 'create')) do |controller|
      controller.should_receive(:logged_in?).and_return(false)
    end
    assert_redirected_to response, url(:login), :message => {:error => 'Login oder Passwort falsch!'}
  end
  
end
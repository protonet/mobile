require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe Sessions, "methods" do
  
  it "should allow you a get on new, create action without redirection to the login page" do
    [:new, :create].each {|action| dispatch_to(Sessions, action).should be_successful}
  end
  
  it "should allow you to destroy a session and the redirect you to the login page" do
    
    current_user= User.new(:id => 10)
    session[:user].should == current_user.id
    dispatch_to(Sessions, :destroy).should redirect_to(url(:home))
    session[:user].should == nil
  end
    
end
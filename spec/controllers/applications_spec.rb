require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

# any controller that inherits from application.rb
class AnyController < Application
  
  def bar
    'foo'
  end
  
end

describe AnyController, "inheriting from Application" do

  it "should redirect to login with notice unless told so otherwise" do
    get(url(:controller => 'any_controller', :action => 'bar')).should redirect_to(url(:login), {:message => { :error => 'Bitte einloggen oder einen neuen User anlegen (kostenlos, keine Daten notwendig!).' }})
  end

end

# end of any controller tests

describe Application, "authentication methods" do
  
  it "should tell you if the user is logged in" do
    pending
    # logged_in?
  end
  
  it "should allow you to set a current user" do
    pending
    # current_user=
  end
  
  it "should return the current user" do
    pending
    # current_user
  end
  
  # TODO following tests could be split up differently, will keep them as they are for now

  it "should be able to enforce a login and redirect you if you're not authorized" do
    pending
  end
  
  it "should have the ability to generally log you in" do
    pending
  end
  
  it "should be able to log you in from a session" do
    pending
  end
  
  it "should be able to log you in from a cookie" do
    pending
  end
  
end


require File.join( File.dirname(__FILE__), '..', "spec_helper" )

describe User, "basically" do
  
  it "should have certain attributes to be valid" do
    pending
  end
  
  it "should downcase your login before creation of your user" do
    pending
  end
  
  it "should check that you confirm your password on password changes" do
    pending
  end
  
  it "should encrypt the given password before saving it" do
    pending
  end
  
  it "should allow you to authenticate a user with a given set of login and password" do
    pending
  end
  
end

describe User, "authentication" do
  
  it "should allow basic authentication with a given set of login and password" do
    pending
  end
  
  it "should return the authenticated user when successful" do
    pending
  end
  
  it "should return nil when the authentication failed" do
    pending
  end
  
end
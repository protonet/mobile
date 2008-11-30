require File.join( File.dirname(__FILE__), '..', "spec_helper" )

describe "The ubuntu backend adapter initialization" do

  it "should initialize with the default setting unless overridden" do
    pending
  end

end

describe "The ubuntu backen adapter in general" do
  
  before(:all) do
    @backend = BackendAdapters::Ubuntu.new
  end
  
  it "should have a method that return its info data" do
    @backend.info.should == "ubuntu backend" # ;) yeah I know its not much right now
  end
  
  it "should be able to get the ip of currently connected clients" do
    pending
  end
  
  it "should be able to give a client internet rights" do
    pending
  end
  
  it "should be able to revoke a clients internet rights" do
    pending
  end
  
  it "should have a method to get the mac addresses of all the connected clients to an interface" do
    pending
  end
  
  it "should be able to get the ip for a given mac address" do
    pending
  end
  
  it "should be able to refresh the gotten mac/ip connection to ensure that it's still accurate" do
    pending
  end
  
end
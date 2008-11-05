require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe ChatMessages, "index action" do
  before(:each) do
    @controller = dispatch_to(ChatMessages, :index)
  end
  
  it "should return the "
end

describe Instruments, "methods" do

  before(:each) do
    @controller = dispatch_to(Instruments, :index) do |controller|
      controller.should_receive(:login_required).and_return(true)
      controller.instance_variable_set(:@current_user, User.new(:id => 1, :login => 'foobar'))
    end
  end
  
  it "should have the lobby room ready as an instance variable" do
    @controller.assigns(:lobby).id.should == 1
    @controller.assigns(:lobby).name.should == 'Lobby'
  end
  
  it "should be successful" do
    @controller.should be_successful
  end
  
end
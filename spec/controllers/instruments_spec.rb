require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe Instruments, "methods" do

  before(:each) do
    User.all.destroy!
    @user = User.new(:id => 1, :login => 'foobar')
    @user.save
    @controller = dispatch_to(Instruments, :index) do |controller|
      controller.should_receive(:login_required).and_return(true)
      controller.instance_variable_set(:@current_user, @user)
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
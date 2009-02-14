require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe Instruments, "index method" do

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
    assert_equal 1, @controller.assigns(:lobby).id
    assert_equal 'Lobby', @controller.assigns(:lobby).name
  end
  
  it "should have the user join the lobby" do
    pending
  end
  
  it "should be successful" do
    assert_response :ok, @controller
  end
  
end
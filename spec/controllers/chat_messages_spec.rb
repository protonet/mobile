require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')

describe ChatMessages, "index action" do
  before(:each) do
    @controller = dispatch_to(ChatMessages, :index)
  end
    
  it 'should return the messages for the requested room given you are allowed to see it' do
    pending
  end
  
  it 'should render the messages as text' do
    pending
  end

end

describe ChatMessages, "create action" do

  before(:each) do
    @controller = dispatch_to(ChatMessages, :create)
  end
  
  it "should raise an exception if you are sending a message as an user id other than yours (e.g. older window still open)" do
    pending
  end

  it 'should return the created messages id as simple text' do
    pending
  end
    
end
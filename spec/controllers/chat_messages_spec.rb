require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')
# require 'ruby-debug'

describe ChatMessages, "index action" do
  before(:all) do
    ChatRoom.all.destroy!
    User.all.destroy!
    @room = ChatRoom.new
    @msg1 = ChatMessage.new
    assert @msg1.save
    @msg2 = ChatMessage.new
    assert @msg2.save
    @room.messages << @msg1
    @room.messages << @msg2
    assert @room.save
    @user = User.new({:login => 'fooo', :password => 'foo'})
    @user.chat_rooms << @room
    assert @user.save
  end
    
  it 'should return the messages for the requested room' do
    response = get(url(:controller => 'chat_messages', :action => 'index'), {:room_id => @room.id})
    # debugger
    # response.assigns
  end
  
  it 'should return the messages for the requested room given only if you are allowed to see it' do
    pending
  end
  
  it 'should render the messages as text/json' do
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
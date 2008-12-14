require File.join(File.dirname(__FILE__), '..', 'spec_helper.rb')
# require 'ruby-debug'

describe ChatMessages, "index action" do
  before(:all) do
    @user = User.gen
    @room = ChatRoom.gen(:messages => 3.of {ChatMessage.gen})
  end
  
  it 'should be succesful' do
    response = dispatch_to(ChatMessages, :index, {:room_id => @room.id}) do |controller|
      controller.should_receive(:login_required).and_return(true)
    end
    assert_response :ok, response
  end
  
  it 'should return find all the messages for the requested room' do
    ChatRoom.should_receive(:get).with(@room.id.to_s).and_return(@room)
    response = dispatch_to(ChatMessages, :index, {:room_id => @room.id}) do |controller|
      controller.should_receive(:login_required).and_return(true)
    end
  end
  
  it 'should return the messages for the requested room given only if you are allowed to see it' do
    pending
  end
  
  it 'should render the messages as text/json' do
    ChatRoom.should_receive(:get).with(@room.id.to_s).and_return(@room)
    @room.messages.should_receive(:to_json).and_return('foobar')
    response = dispatch_to(ChatMessages, :index, {:room_id => @room.id}) do |controller|
      controller.should_receive(:login_required).and_return(true)
    end
    assert_equal 'foobar', response.body
  end

end

describe ChatMessages, "create action" do

  before(:all) do
    ChatMessage.all.destroy!
    @user = User.gen
    @room = ChatRoom.gen
  end
  
  it "should allow you to create an message and add it to a room" do
    assert_empty @room.messages
    response = dispatch_to(ChatMessages, :create, {:room_id => @room.id, :text => 'foobarius foo', :user_id => @user.id}) do |controller|
      set_current_user(controller, @user)
    end
    assert_equal 1, @room.reload.messages.size
    assert_equal 'foobarius foo', @room.messages[0].text
    assert_equal @user, @room.messages[0].user
  end
  
  it "should raise an exception if you are sending a message as an user id other than yours (e.g. older window still open)" do
    assert_raises(NameError) do
      dispatch_to(ChatMessages, :create, {:room_id => @room.id, :text => 'foobarius foo', :user_id => (@user.id + 1)}) do |controller|
        set_current_user(controller, @user)
      end
    end
  end

  it 'should return the created messages id as simple text' do
    response = dispatch_to(ChatMessages, :create, {:room_id => @room.id, :text => 'foobarius foo', :user_id => @user.id}) do |controller|
      set_current_user(controller, @user)
    end
    assert_equal response.assigns(:message).id.to_s, response.body
  end
    
end
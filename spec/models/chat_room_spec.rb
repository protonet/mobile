require File.join( File.dirname(__FILE__), '..', "spec_helper" )

describe ChatRoom, 'lobby functionality' do
  
  before(:all) do
    # remove the lobby if it exists
    (r = ChatRoom.get(1)) && r.destroy
  end

  it "should return or create the lobby" do
    ChatRoom.get(1).should == nil
    ChatRoom.lobby.should == ChatRoom.get(1)
    ChatRoom.lobby
    ChatRoom.all.size.should == 1
  end

end

describe ChatRoom, 'users' do
  before(:all) do
    @user = User.new(:name => 'foo').save
  end
  
  it "should allow adding users to a room" do
    room = ChatRoom.lobby
    room.users << @user
    p room.users
  end
  
end
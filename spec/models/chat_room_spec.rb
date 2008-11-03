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
  
  it "should allow adding users to a room" do
    
  end
  
end
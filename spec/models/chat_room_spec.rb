require File.join( File.dirname(__FILE__), '..', "spec_helper" )

describe ChatRoom, 'lobby functionality' do
  
  before(:all) do
    # remove the lobby if it exists
    (r = ChatRoom.get(1)) && r.destroy
  end

  it "should return or create the lobby" do
    assert_nil ChatRoom.get(1)
    assert_equal ChatRoom.lobby, ChatRoom.get(1)
    ChatRoom.lobby
    assert_equal 1, ChatRoom.all.size
  end

end

describe ChatRoom, 'users' do
  before(:all) do
    @user = User.new(:name => 'foo').save
  end
  
  before(:all) do
    User.all.destroy!
    @user = User.new(:login => 'foo', :password => 'blub')
    @user.save
  end
  
  # this tests datamapper functionality but I was eager to see wether it would really work as expected
  it "should allow adding users to a room" do
    room = ChatRoom.lobby
    room.users << @user
    room.save
    assert_equal [@user], ChatRoom.lobby.users
  end
  
end
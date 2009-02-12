require File.join( File.dirname(__FILE__), '..', "spec_helper" )

describe ChatRoom, 'lobby functionality' do
  
  before(:all) do
    ChatRoom.all.destroy!
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
    User.all.destroy!
    @user = User.gen
  end
  
  # this tests datamapper functionality but I was eager to see wether it would really work as expected
  # addendum: good thing I tested this. There is a bug in the HABTM management of DM
  it "should allow adding users to a room" do
    room = ChatRoom.lobby
    # todo fix when DM bug has been fixed
    # room.users << @user
    # room.save
    ChatRoomUser.create(:chat_room_id => room.id, :user_id => @user.id)
    assert_equal [@user], ChatRoom.lobby.users
  end
  
end

describe ChatRoom, 'creation' do

  before(:all) do
    ChatRoom.all.destroy!
  end
  
  it "should be possible" do
    room = ChatRoom.new
    assert room.save
    assert_equal room, ChatRoom.get(room.id)
  end
  
end
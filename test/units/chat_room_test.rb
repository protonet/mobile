require File.dirname(__FILE__) + '/../test_helper'

class ChatRoomTest < Test::Unit::TestCase

  context "Lobby functionality" do
    before do
      (r = ChatRoom.get(1)) && r.destroy
    end
    
    test "should return or create the lobby" do
      assert_nil ChatRoom.get(1)
      assert_equal ChatRoom.lobby, ChatRoom.get(1)
      ChatRoom.lobby
      assert_equal 1, ChatRoom.all.size
    end
  end

  context 'users' do
    before do
      User.all.destroy!
      @user = User.new(:login => 'foo', :password => 'blub')
      @user.save
    end

    # this tests datamapper functionality but I was eager to see wether it would really work as expected
    test "should allow adding users to a room" do
      room = ChatRoom.lobby
      room.users << @user
      room.save
      assert_equal [@user], ChatRoom.lobby.users
    end

  end  
end

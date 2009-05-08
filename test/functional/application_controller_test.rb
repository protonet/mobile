require File.expand_path(File.join(File.dirname(__FILE__), '../test_helper'))

# actually all this stuff belongs into a unit test...

class TestController < ApplicationController
  
  def index
    @user = logged_out_user
    render :nothing => true
  end
  
end


class TestControllerTest < ActionController::TestCase

  test "should return a logged out user" do
    get :index, {}, {:session_id => 'foobariusfoo'}
    user = assigns(:user)
    assert user.is_a?(User)
    assert user.logged_out?
  end
  
  test "should store a User.coward in the current user instance variable" do
    session_id = 'foobariusfoo'
    User.expects(:coward).with(session_id[0,10]).returns('foo')
    get :index, {}, {:session_id => session_id}
    assert_equal 'foo', assigns(:current_user)
  end

end

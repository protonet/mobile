require 'test_helper'

class InstrumentsControllerTest < ActionController::TestCase
  # Replace this with your real tests.
  test "should render the public dashboard if you're not logged in" do
    @controller.stubs(:logged_in?).returns(false)
    get :index
    assert_equal 'public', @response.body
  end
  
  test "should render the private dashboard if you're logged in" do
    @controller.stubs(:logged_in?).returns(true)
    get :index
    assert_equal 'private', @response.body
  end
  
end

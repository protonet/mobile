require File.join(File.dirname(__FILE__), '..', "test_helper")

# any controller that inherits from application.rb
class AnyController < Application
  # Re-raise errors caught by the controller.
  def rescue_action(e) raise e end;
  
  def bar
    'foo'
  end
  
end

class ApplicationControllerTest < Test::Unit::TestCase
  
  context "Any controller inheriting from Application" do

    test "should redirect to login with notice" do
      response = get(url(:controller => 'any_controller', :action => 'bar'))
      assert_redirect_to(url(:login), response)
    end

  end
end

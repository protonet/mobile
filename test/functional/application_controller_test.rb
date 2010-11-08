require File.expand_path(File.join(File.dirname(__FILE__), '../test_helper'))

# actually all this stuff belongs into a unit test...

class TestController < ApplicationController
  
  def index
    @user = User.stranger(session[:session_id])
    render :nothing => true
  end
  
end


class TestControllerTest < ActionController::TestCase
end

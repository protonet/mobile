module Merb::Test::Unit::ControllerAsserts
  def assert_redirect_to(expected, target)
    location, query = target.headers["Location"].split("?")
    
    assert_redirect(target)
    assert_equal(expected, location, redirect_to_failure_message(expected, location))
  end
end

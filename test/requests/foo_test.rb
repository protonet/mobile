require File.join(File.dirname(__FILE__), '..', "test_helper")

# Re-raise errors caught by the controller.
class Foo; def rescue_action(e) raise e end; end

class FooTest < Test::Unit::TestCase

  def setup
    @resonse = request("/foo")
  end

  # Replace this with your real tests.
  def test_should_be_setup
    assert false
  end
end
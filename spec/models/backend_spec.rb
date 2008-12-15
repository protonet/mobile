require File.join( File.dirname(__FILE__), '..', "spec_helper" )

describe Backend do

  it "should define a series of api calls" do
    assert_kind_of Array, Backend.send(:class_variable_get, :@@backend_api_methods)
  end
  
  it "should have a backend connection settable as a class method" do
    Backend.backend_connection = 'foo'
    assert_equal 'foo', Backend.backend_connection
  end
  
  it "should forward all defined api methods to the connected backend adapter with complete args" do
    Backend.send(:class_variable_set, :@@backend_api_methods, [:bar])
    adapter_mock = mock("bla", {:bar => 'success'})
    Backend.backend_connection = adapter_mock
    assert_equal 'success', Backend.bar
  end
  
  it "should raise a standard method not defined error when a method is called that is not part of the api" do
    assert_raises(NoMethodError) { Backend.foobar('something') }
  end

end
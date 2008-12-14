def assert(foo)
  !!foo
end

def assert_equal(a, b)
  b.should == a
end

def assert_not_equal(a, b)
  b.should_not == a
end

def assert_not_nil(a)
  a.should_not == nil
end

def assert_nil(a)
  a.should == nil
end

def assert_redirected_to(response, url, message =nil)
  response.should redirect_to(url, message)
end

def assert_not_redirected(foo)
  foo.should_not redirect
end

def assert_raises(*args, &blk)
  blk.should raise_error(*args)
end

def assert_nothing_raised(&blk)
  blk.should_not raise_error
end

def assert_response(code, response)
  case code
  when :ok
    response.should be_successful
  end
end

def assert_empty(obj)
  obj.should be_empty
end
# some additional helper methods
def create_users(number=1)
  # User.new(:)
end

## Users

def default_user_attributes(valid=true)
  vaild ? {:name => 'ali', :login => 'foobar'} : {}
end

def build_user(options={})
  User.new(default_user_attributes).merge!(options)
end

def create_user(options)
  foo = build_user(options)
  foo.save
  foo
end

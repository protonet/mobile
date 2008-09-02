class User
  include DataMapper::Resource
  
  property :id, Integer, :serial => true
  property :name, String
  property :password, String

end

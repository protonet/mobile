class Room
  include DataMapper::Resource
  
  property :id,                         Integer,  :serial => true
  property :user_id,                    Integer
  property :name,                       String
  

end

class UserProfile
  include DataMapper::Resource
  
  property :id,                         Integer,  :serial => true
  property :description,                String
  property :profile_pic_url,            String
  property :xing_profile,               String
  property :twitter_account,            String
  property :public,                     Boolean,  :default => true
  
  def chat_attributes
    {:profile_pic => profile_pic_url}
  end

end

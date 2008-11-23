class AssetList
  include DataMapper::Resource
  
  has n, :assets
  
  property :id,                         Serial
  property :name,                       String,   :nullable => false
  property :description,                String,   :nullable => true
  property :user_id,                    Integer
  property :created_at,                 DateTime
  property :view_counter,               Integer

  validates_present           :name
  validates_present           :created_at
  
end

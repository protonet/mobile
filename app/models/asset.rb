class Asset
  include DataMapper::Resource
  
  attr_accessor :tempfile
  
  before :save, :move_tmp_file
  
  belongs_to :user
  belongs_to :asset_list
  
  property :id,                         Integer,  :serial => true
  property :filename,                   String,   :nullable => false
  property :content_type,               String,   :nullable => true
  property :size,                       Integer,  :nullable => false
  property :user_id,                    Integer
  property :asset_list_id,              Integer 
  property :created_at,                 DateTime
  property :download_counter,           Integer
  
  validates_present           :filename
  validates_present           :size
  validates_present           :created_at
  
  def move_tmp_file
    FileUtils.mv( tempfile.path, file_path(true) )
  end
  
  def file_path(from_root = false)
    (from_root ? Merb.root_path + '/public' : '') + "/uploads/#{filename}"
  end

end

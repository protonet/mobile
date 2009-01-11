class Asset
  include DataMapper::Resource
  
  attr_accessor :tempfile
  
  before :save, :move_tmp_file
  after :create, :publish_notification
  
  belongs_to :user
  belongs_to :asset_list
  
  property :id,                         Integer,  :serial => true
  property :filename,                   String,   :length => 255, :nullable => false
  property :content_type,               String,   :length => 255, :nullable => true
  property :size,                       Integer,  :nullable => false
  property :user_id,                    Integer
  property :asset_list_id,              Integer 
  property :created_at,                 DateTime
  property :download_counter,           Integer
    
  def self.unsorted
    all(:asset_list_id => nil)
  end
  
  def self.unclaimed
    all(:user_id => nil)
  end
  
  def self.yours(user_id = nil)
    user_id ||= current_user.id
    all(:user_id => user_id)
  end
  
  def move_tmp_file
    if new_record?
      FileUtils.mv(tempfile.path, file_path(true))
      # FIXME added hotfix, this needs to be reviewed :)
      FileUtils.chmod(0666, file_path(true))
    end
  end
  
  def file_path(from_root = false)
    (from_root ? Merb.root_path + '/public' : '') + "/uploads/#{filename}"
  end
  
  def publish_notification
    MessagingBus.topic('assets').publish(self.to_json, :key => 'assets.all')
  end
  
  def to_json
    self.attributes.to_json
  end

end

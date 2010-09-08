class Channel < ActiveRecord::Base
  include FlagShihTzu

  belongs_to  :owner, :class_name => "User"
  belongs_to  :network

  has_many  :says
  has_many  :tweets, :through => :says

  has_many  :listens, :dependent => :destroy
  has_many  :users,   :through   => :listens

  validates_uniqueness_of   :name, :uuid
  validates_length_of       :name,     :maximum => 30

  before_validation_on_create :normalize_name
  after_create  :generate_uuid,   :if => lambda {|c| c.uuid.blank? }
  after_create  :create_folder,   :if => lambda {|c| !c.home?}
  after_create  :subscribe_owner, :if => lambda {|c| !c.home?}

  named_scope :public,   :conditions => {:public => true}

  # privacy
  #   public  = everyone can subscribe and listen to channel immedietly
  #   private = everyone can subscribe and listen to channel after owner's verification
  # visibility
  #   global = channel is listed in all clients connected to the node (also via other nodes!)
  #   local  = channel is listed only in clients directly connected to the node
  has_flags 1 => :public,
            2 => :global

  def self.home
    begin
      find(1)
    rescue ActiveRecord::RecordNotFound
      channel = Channel.new(:name => 'home', :description => 'your homebase - your node :)')
      channel.save && update_all("id = 1", "id = #{channel.id}")
      channel = find(1)
      channel.create_folder
      channel
    end
  end

  def self.names
    all(:select => :name).map {|c| c.name.downcase }
  end
  
  def normalize_name
    self.name = clean_diactritic_marks(name)
    self.name = name.gsub(/\W/, '-').downcase
  end
  
  def home?
    id == 1
  end
  
  def subscribe_owner
    owner && owner.subscribe(self)
  end

  def owned_by(user)
    owner == user
  end

  def create_folder
    begin
      path = System::FileSystem.cleared_path("/#{id.to_s}")
      FileUtils.mkdir(path)
    rescue Errno::EEXIST
      logger.warn("A path for the #{name} already exists at #{path}") and return true
    end
  end
  
  def generate_uuid
    raise RuntimeError if uuid
    self.update_attribute(:uuid, UUID.create.to_s)
  end
  
  private
  def clean_diactritic_marks(string)
    ActiveSupport::Multibyte::Chars.new(string).mb_chars.normalize(:kd).gsub(/[^\x00-\x7F]/n,'').to_s
  end

end

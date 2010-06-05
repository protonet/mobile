class Channel < ActiveRecord::Base

  belongs_to   :owner, :class_name => "User"
  
  has_many  :says
  has_many  :tweets, :through => :says
  
  has_many  :listens
  has_many  :users, :through    => :listens
  
  after_create :create_folder
  after_create :subscribe_owner, :if => lambda {|c| !c.home?}


  def self.home
    begin
      find(1)
    rescue ActiveRecord::RecordNotFound
      channel = Channel.new(:name => 'home', :description => 'your homebase - your node :)')
      channel.save && update_all("id = 1", "id = #{channel.id}")
      find(1)
    end
  end
  
  def self.names
    all(:select => :name).map {|c| c.name.downcase }
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

end

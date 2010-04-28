class Channel < ActiveRecord::Base

  belongs_to   :owner, :class_name => "User"
  
  has_many  :says
  has_many  :tweets, :through => :says
  
  has_many  :listens
  has_many  :users, :through    => :listens
  
  after_create :create_folder

  
  def self.home
    begin
      find(1)
    rescue ActiveRecord::RecordNotFound
      Channel.new(:id => 1, :name => 'home', :description => 'your homebase - your node :)').save && find(1)
    end
  end
  
  def owned_by(user)
    owner == user
  end
  
  def create_folder
    FileUtils.mkdir(System::FileSystem.cleared_path("/#{id.to_s}"))
  end

end

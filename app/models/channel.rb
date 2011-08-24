class Channel < ActiveRecord::Base
  include Rabbit
  
  belongs_to  :owner, :class_name => "User"
  belongs_to  :network

  has_many  :meeps

  has_many  :listens, :dependent => :destroy
  has_many  :users,   :through   => :listens

  validates_uniqueness_of   :name, :uuid
  validates_length_of       :name,     :maximum => 30
  
  before_validation :prepare_rendezvous,  :on => :create, :if => lambda {|c| !!c.rendezvous }
  before_validation :normalize_name,      :on => :create
  
  after_create  :generate_uuid,     :if => lambda {|c| c.uuid.blank? }
  after_create  :create_folder,     :if => lambda {|c| !c.home?}
  after_create  :subscribe_owner,   :if => lambda {|c| !c.home? && !c.skip_autosubscribe}

  attr_accessor   :skip_autosubscribe
  attr_accessible :skip_autosubscribe, :name, :description, :owner, :owner_id, :network, :network_id, :display_name, :public, :global

  scope :public,   :conditions => {:public => true}

  # TODO handle 1on1's correctly
  scope :real,  :conditions => {:rendezvous => nil}

  def self.home
    begin
      find(1)
    rescue ActiveRecord::RecordNotFound
      channel = Channel.new(:name => 'home', :description => 'your homebase - your node :)', :owner_id => -1)
      channel.id = 1
      channel.save
      channel.reload
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
  
  def prepare_rendezvous
    self.name = "rendezvous-#{self.rendezvous}"
    self.public = false
    true
  end
  
  def home?
    id == 1
  end
  
  def rendezvous?
    !rendezvous.blank?
  end
  
  def rendezvous_participant?(user)
    rendezvous_participants.include?(user)
  end
  
  def locally_hosted?
    network_id == 1
  end
  
  def subscribe_owner
    if rendezvous?
      rendezvous_participants.each { |u| u.subscribe(self) }
    else
      owner && owner.subscribe(self)
    end
  end

  def owned_by(user)
    owner == user
  end

  def create_folder
    begin
      path = SystemFileSystem.cleared_path("/#{id.to_s}")
      FileUtils.mkdir(path)
    rescue Errno::EEXIST
      logger.warn("A path for the #{name} already exists at #{path}") and return true
    end
  end
  
  def generate_uuid
    raise RuntimeError if uuid
    self.update_attribute(:uuid, UUID4R::uuid(1))
  end
  
  def self.prepare_for_frontend(channel)
    meeps = channel.meeps.recent.all(:limit => 25)
    {
      :id           => channel.id,
      :rendezvous   => channel.rendezvous,
      :name         => channel.name,
      :display_name => channel.display_name || channel.name.capitalize,
      :meeps        => Meep.prepare_for_frontend(meeps, { :channel_id => channel.id })
    }
  end
  
  # TODO:
  #   Dearest dudemeister,
  #   
  #   I'm sure you can write this better.
  #   Please do so and show me the right path.
  #
  #   Yours faithfully,
  #   Young Padawan.
  #
  def self.setup_rendezvous_for(current_user_id, partner_id)
    raise RuntimeError if current_user_id == partner_id
    rendezvous_key = [current_user_id, partner_id].sort.join(':')
    already_exists = find_by_rendezvous(rendezvous_key)
    channel = find_or_create_by_rendezvous(rendezvous_key, :owner_id => current_user_id)
    channel.listens.each {|l|
      channel.publish 'users', l.user_id,
        :trigger    => 'channel.load',
        :channel_id => channel.id
    } if already_exists
    channel
  end
  
  def rendezvous_participants
    rendezvous ? rendezvous.split(':').map { |id| User.find(id) } : []
  end
  
  private
    def clean_diactritic_marks(string)
      ActiveSupport::Multibyte::Chars.new(string).mb_chars.normalize(:kd).gsub(/[^\x00-\x7F]/n,'').to_s
    end
end

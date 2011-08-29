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
  after_create  :subscribe_rendezvous_participant, :if => lambda {|c| c.rendezvous?}

  attr_accessor   :skip_autosubscribe
  attr_accessible :skip_autosubscribe, :name, :description, :owner, :owner_id, :network, :network_id, :display_name, :public, :global

  scope :public,   :conditions => {:public => true}

  # TODO handle 1on1's correctly
  scope :real,  :conditions => {:rendezvous => nil}
  scope :verified, :conditions => {:listens => {:verified => true}}

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
  
  def self.prepare_for_frontend(channel, current_user)
    meeps = channel.meeps.includes(:user).recent.all(:limit => 25)
    {
      :id               => channel.id,
      :rendezvous       => channel.rendezvous,
      :name             => channel.name,
      :display_name     => channel.rendezvous_name(current_user) || channel.display_name || channel.name.capitalize,
      :last_read_meep   => (channel.last_read_meep rescue nil),
      :listen_id        => (channel.listen_id rescue nil),
      :meeps            => Meep.prepare_for_frontend(meeps, { :channel_id => channel.id })
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
  def self.setup_rendezvous_for(first_user_id, second_user_id)
    raise RuntimeError if first_user_id == second_user_id
    key = rendezvous_key(first_user_id, second_user_id)
    already_exists = find_by_rendezvous(key)
    channel = find_or_create_by_rendezvous(key, :owner_id => first_user_id)
    channel.listens.each {|l|
      channel.publish 'users', l.user_id,
        :trigger    => 'channel.load',
        :channel_id => channel.id
    } if already_exists
    channel
  end
  
  def self.rendezvous_key(first_user_id, second_user_id)
    [first_user_id.to_i, second_user_id.to_i].sort.join(':')
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
  
  def listen_id
    super.to_i
  end

  def last_read_meep
    super.to_i
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
    owner && owner.subscribe(self)
  end
  
  def subscribe_rendezvous_participant
    rendezvous_participants.each { |u| u.subscribe(self) }
  end

  def owned_by(user)
    owner == user
  end
  
  def has_unread_meeps
    last_posted_meep = meeps.last && meeps.last.id
    
    last_read_meep && last_posted_meep && last_posted_meep > last_read_meep
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
  
  def rendezvous_participants
    rendezvous ? rendezvous.split(':').map { |id| User.find(id) } : []
  end
  
  def rendezvous_name(current_user)
    return nil unless rendezvous?
    user_id = rendezvous.split(':').find { |id| id.to_i != current_user.id }
    User.find(user_id).display_name rescue 'stranger'
  end
  
  private
    def clean_diactritic_marks(string)
      ActiveSupport::Multibyte::Chars.new(string).mb_chars.normalize(:kd).gsub(/[^\x00-\x7F]/n,'').to_s
    end
end

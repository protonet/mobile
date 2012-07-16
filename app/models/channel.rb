require 'ffi-xattr'

class Channel < ActiveRecord::Base
  include Rabbit
  
  belongs_to  :owner, :class_name => "User"
  belongs_to  :node

  has_many  :meeps

  has_many  :listens, :dependent => :destroy
  has_many  :users,   :through   => :listens

  validates_uniqueness_of   :name, :scope => :node_id
  validates_uniqueness_of   :uuid
  validates_length_of       :name, :maximum => 30, :minimum => 1
  
  before_validation :prepare_rendezvous,  :on => :create, :if => lambda {|c| c.rendezvous? }
  before_validation :normalize_name
  
  after_create  :generate_uuid,                     :if => lambda {|c| c.uuid.blank? }
  after_create  :create_folder,                     :if => lambda {|c| !c.global? }
  after_create  :subscribe_owner,                   :if => lambda {|c| !c.home? && !c.skip_autosubscribe && !c.rendezvous? }
  after_create  :subscribe_rendezvous_participant,  :if => lambda {|c| c.rendezvous? }
  after_create  :send_create_notification,          :if => lambda {|c| !c.rendezvous? }
  
  after_update :send_update_notification
  
  after_destroy :delete_folder
  
  attr_accessor   :skip_autosubscribe
  attr_accessible :skip_autosubscribe, :name, :description, :owner, :owner_id, :node, :node_id, :display_name, :public, :global, :system

  scope :without_system, :conditions => {:system => false}
  scope :public, :conditions => {:public => true}
  scope :real,  :conditions => {:rendezvous => nil}
  scope :rendezvous, where('rendezvous IS NOT NULL') 
  scope :verified, :conditions => {:listens => {:verified => true}}
  scope :local, :conditions => {:node_id => 1}
  scope :order_by_name, :order => "name ASC"
  
  def self.support
    uuid = "b0138cc6-ffbb-11e0-92ce-0024215f2168"
    channel = Channel.find_by_uuid(uuid)
    unless channel
      Node.couple(:url => "https://team.protonet.info").attach_global_channel(uuid)
      channel = Channel.find_by_uuid(uuid)
    end
    channel
  end
  
  def self.recent_active
    channel_ids = Channel.connection.select_values("
      SELECT channel_id, count(meeps.id) as counter FROM meeps left outer join channels on channels.id = meeps.channel_id
      WHERE meeps.created_at > '#{(Time.now - 2.weeks).to_s(:db)}' AND channels.node_id = 1 AND rendezvous IS NULL
      GROUP BY channel_id ORDER BY counter DESC, meeps.id DESC LIMIT 5
    ")
    
    channel_ids.empty? ? [home] : find(channel_ids)
  end
  
  def self.home
    begin
      find(1)
    rescue ActiveRecord::RecordNotFound
      owner = User.admins.first || User.anonymous
      channel = Channel.new(:name => 'home', :description => 'This node\'s main channel', :owner => owner)
      channel.id = 1
      channel.save
      channel.reload
      channel.create_folder
      channel
    end
  end
  
  def self.system
    system_channel = find_by_system(true)
    unless system_channel
      description = "This is the node's system channel. The node itself will publish any system relevant notifications here."
      message     = "Hi,\n\nThis is your node speaking. I will publish any system relevant messages here (eg. hard disk failures, virus scans).\n" +
                    "Only administrators of this node can see this channel.\n\nYours faithfully,\nprotonet node"
      system_channel = Channel.create(
        :name         => 'System',
        :description  => description,
        :owner        => User.system,
        :system       => true,
        :public       => false
      )
      
      Meep.create_system_message(message)
      User.admins.each { |admin| admin.subscribe(system_channel) }
    end
    system_channel
  end

  def self.names
    all(:select => :name).map {|c| c.name.downcase }
  end
  
  def self.prepare_for_frontend(channel, include_meeps=false)
    obj = {
      :id               => channel.id,
      :uuid             => channel.uuid,
      :node_id          => channel.node_id,
      :private          => !channel.public?,
      :global           => channel.global?,
      :rendezvous       => channel.rendezvous,
      :system           => channel.system?,
      :name             => channel.name,
      :last_read_meep   => (channel.last_read_meep rescue nil),
      :listen_id        => (channel.listen_id rescue nil)
    }
    
    if include_meeps
      meeps = channel.meeps.includes(:user).recent.all(:limit => 25)
      obj[:meeps] = Meep.prepare_many_for_frontend(meeps, :channel_id => channel.id)
    end
    
    obj.delete_if { |key,value| !value }
  end
  
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
    self.name = name.gsub(/\W+/, '-').gsub(/^\-+|\-+$/, "").downcase
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
  
  def global?
    super || !locally_hosted?
  end
  
  def home?
    id == 1
  end
  
  def display_name
    super || name
  end
  
  def rendezvous?
    !rendezvous.blank?
  end
  
  def rendezvous_participant?(user)
    rendezvous_participants.include?(user)
  end
  
  def locally_hosted?
    node_id == 1
  end
  
  def subscribe_owner
    owner && owner.subscribe(self)
  end
  
  def subscribe_rendezvous_participant
    rendezvous_participants.each { |u| u.subscribe(self) }
  end

  def owned_by?(user)
    owner == user
  end
  
  def can_be_edited_by?(user)
    owner == user || user.admin?
  end
  
  def has_unread_meeps
    last_posted_meep = meeps.last && meeps.last.id
    
    last_read_meep && last_posted_meep && last_posted_meep > last_read_meep
  end
  
  def create_folder
    path = "#{configatron.files_path}/channels/#{id}"
    FileUtils.mkdir_p(path, :mode => 0770)
    xattr = Xattr.new(path)
    # every xattr needs to be prefixed by "user." in order to work under linux
    xattr["user.uuid"] = uuid
  end
  
  def delete_folder
    FileUtils.rm_rf(configatron.files_path + "/channels/#{id}")
  end
  
  def generate_uuid
    raise RuntimeError if uuid
    self.update_attribute(:uuid, UUID4R::uuid(1))
  end
  
  def rendezvous_participants
    rendezvous ? rendezvous.split(':').map { |id| User.find_by_id(id) } : []
  end
    
  def random_users(amount=5)
    users.registered.all(:order => 'rand()', :limit => amount)
  end

  def rename_system_folders
    if name_changed? && node.local?
      users.registered.all.each do |user|
        `mv #{configatron.files_path}/system_users/#{user.login}/channels/#{name_was} #{configatron.files_path}/system_users/#{user.login}/channels/#{name}`
      end
    end
  end
  
  private
    def clean_diactritic_marks(string)
      ActiveSupport::Multibyte::Chars.new(string).mb_chars.normalize(:kd).gsub(/[^\x00-\x7F]/n,'').to_s
    end
    
    def send_create_notification
      publish "system", "channels", Channel.prepare_for_frontend(self).merge(:trigger => 'channel.created')
    end
    
    def send_update_notification
      publish "system", "channels", Channel.prepare_for_frontend(self).merge(:trigger => 'channel.updated')
    end
end

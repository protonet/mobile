require 'digest/sha1'

class User < ActiveRecord::Base
  include Rabbit
  
  devise :recoverable, :database_authenticatable, :registerable, :encryptable, :rememberable, :token_authenticatable, :encryptor => :restful_authentication_sha1

  attr_accessible :login, :email, :first_name, :last_name, :password, :avatar_url,
    :channels_to_subscribe, :external_profile_url, :node, :node_id, :notify_me

  attr_accessor :channels_to_subscribe, :invitation_token, :avatar_url

  belongs_to :node
  has_many  :meeps
  has_many  :listens,  :dependent => :destroy
  has_many  :channels,          :through => :listens, :select => "channels.*, listens.id AS listen_id, listens.last_read_meep as last_read_meep"
  has_many  :owned_channels,    :class_name => 'Channel', :foreign_key => :owner_id
  has_many  :invitations
  has_and_belongs_to_many  :roles, :after_add => :handle_admin, :after_remove => :unhandle_admin
  
  has_many :notifications, :as => :subject
  
  has_attached_file :avatar, :default_url => configatron.default_avatar, :preserve_files => true
  
  scope :registered, :conditions => "temporary_identifier IS NULL AND users.id != -1 AND users.node_id = 1"
  scope :strangers,  :conditions => "temporary_identifier IS NOT NULL"
  scope :order_by_login, :order => "login ASC"
  
  before_validation :download_remote_avatar, :if => :avatar_url_provided?
  before_validation :generate_login_from_name
  after_validation :assign_roles_and_channels, :on => :create
  
  before_validation :on => :create, :if => lambda { |u| !u.stranger? && !u.system? } do
    self.last_seen = Time.now
  end
    
  after_create :send_create_notification, :unless => :anonymous?
  after_create :listen_to_channels, :unless => :anonymous?
  after_create :mark_invitation_as_accepted, :if => :invitation_token
  after_create :create_folder, :if => lambda {|u| 
    !u.stranger? && 
    !u.system?
  }
  after_create :refresh_system_users, :if => lambda {|u|
    !u.stranger? &&
    !u.system? &&
    Rails.env.production?
  }
  after_create :send_create_notification, :unless => :anonymous?
  
  after_destroy :move_meeps_to_anonymous
  after_destroy :move_owned_channels_to_anonymous
  after_destroy :delete_folder

  after_update :update_system_user_folder, :if => lambda {|u| 
    !u.stranger? && 
    !u.system?
  }
  
  validates_uniqueness_of :email, :if => lambda {|u| !u.stranger?}
  validates_uniqueness_of :login, :if => lambda {|u| !u.stranger?}
  
  def self.find_for_database_authentication(conditions={})
    where("login = ?", conditions[:login]).limit(1).first ||
    where("email = ?", conditions[:login]).limit(1).first
  end
  
  def self.find_by_id_or_login(id_or_login)
    find_by_id(id_or_login) || find_by_login(id_or_login)
  end
  
  def self.system
    self.anonymous
  end
  
  def self.anonymous
    begin
      find(-1)
    rescue ActiveRecord::RecordNotFound
      user = new(:name => 'System', :login => 'system', :email => 'system@protonet.local')
      user.avatar = File.new("#{Rails.root}/public#{configatron.system_avatar}")
      user.id = -1
      user.save!(:validate => false)
      find(-1)
    end
  end
  
  def self.admins
    Role.find_by_title('admin').users rescue []
  end
  
  def self.prepare_for_frontend(user)
    {
      :id             => user.id,
      :name           => user.display_name,
      :avatar         => user.avatar.url,
      :subscriptions  => user.channels.verified.map(&:id)
    }
  end
  
  def self.build_system_users
    registered.includes(:channels, :listens).each do |user|
      user.create_folder
      user.channels.verified.local.each do |channel|
        channel_path = "channels/#{channel.id}"
        if channel.rendezvous?
          participant = (channel.rendezvous_participants - [user]).first || User.new(:login => "unknown (#{channel.rendezvous})")
          command = "mount #{channel_path} \"system_users/#{user.login}/channels/shared between you and #{participant.login}\""
        else
          command = "mount #{channel_path} system_users/#{user.login}/channels/#{channel.name}"
        end
        user.system_users_script(command)
      end
    end
  end
  
  # devise 1.2.1 calls this
  def valid_password?(password)
    if SystemPreferences.remote_ldap_sign_on == true
      return !!self.class.ldap_authenticate(login, password)
    else
      super
    end
  end
  
  # from http://snipplr.com/view.php?codeview&id=1247
  def self.pronouncable_password
    c = %w( b c d f g h j k l m n p qu r s t v w x z ) +
        %w( ch cr fr nd ng nk nt ph pr rd sh sl sp st th tr )
    v = %w( a e i o u y )
    f, r = true, ''
    6.times do
      r << ( f ? c[ rand * c.size ] : v[ rand * v.size ] )
      f = !f
    end
    2.times do
      r << ( rand( 9 ) + 1 ).to_s
    end
    r
  end
  
  def role_symbols
    roles.map { |role| role.title.to_sym }
  end

  def generate_new_communication_token
    self.communication_token = Devise.friendly_token
    self.communication_token_expires_at = Time.now + 5.day
    save(:validate => false)
    # todo: propagate
  end
  
  def communication_token
    generate_new_communication_token unless communication_token_expires_at && communication_token_expires_at > Time.now
    read_attribute(:communication_token)
  end

  def communication_token_valid?(token)
    token && token == read_attribute(:communication_token) && communication_token_expires_at > DateTime.now
  end

  def send_javascript(javascript)
    publish "users", id, { :eval => javascript }
  end
  
  def move_meeps_to_anonymous
    meeps.each {|t| t.update_attribute(:user_id, -1)}
  end

  def move_owned_channels_to_anonymous
    owned_channels.each {|t| t.update_attribute(:owner_id, -1)}
  end

  def anonymous?
    id == -1
  end
  
  def system?
    id == -1
  end

  def login=(value)
    write_attribute :login, (value ? value.downcase : nil)
  end

  def email=(value)
    write_attribute :email, (value ? value.downcase : nil)
  end

  def display_name
    login
    #name.blank? ? login : name
  end

  # Checks whether a password is needed or not. For validations only.
  # Passwords are always required if it's a new record, or if the password
  # or confirmation are being set somewhere.
  def password_required?
    !stranger? && ( !persisted? || !password.nil?)
  end
  
  # skip validation if the user is a logged out (stranger) user
  def skip_credentials_validation?
    stranger?
  end
  
  def avatar_url_provided?
    !avatar_url.blank?
  end
  
  def first_admin?
    admin? && id == 1
  end
  
  def newbie?
    super && !stranger?
  end
  
  def download_remote_avatar
    t = Tempfile.new(ActiveSupport::SecureRandom.hex(4))
    t.write(open(avatar_url).read)
    t.flush      

    self.avatar = t
  end
  
  def send_create_notification
    return if stranger?
    
    publish 'system', ['users', 'new'], User.prepare_for_frontend(self).merge(:trigger => 'user.created')
  end

  def subscribe(channel)
    return if channels.include?(channel)
    channels << channel
  end

  def unsubscribe(channel)
    return unless channels.include?(channel)
    listens.where(:channel_id => channel.id).first.destroy
  end

  def subscribed?(channel)
    channels.include?(channel)
  end
  
  # channels a user potentially is allowed to see
  def allowed_channels
    # admin: return all real channels + verified (don't show the admin rendezvous channel he didn't subscribe to)
    return Channel.real | channels.verified  if !stranger? && !invitee?
    # user: return all public channels + verified
    #return Channel.public | channels.verified  if !stranger? && !invitee?
    # invitee & stranger: return all verified channels
    return channels.verified
  end
  
  def allowed_users
    if invitee? || stranger?
      users = []
      channels.verified.each do |channel|
        users = users | channel.users.registered
      end
    else
      users = User.registered
    end
    users
  end

  def password_required_with_logged_out_user?
    skip_validation ? false : password_required_without_logged_out_user?
  end
  
  def add_to_role(role_name)
    role = Role.find_by_title!(role_name.to_s)
    unless roles.include?(role)
      self.roles << role
    end
  end
  
  def remove_from_role(role_name)
    role = Role.find_by_title!(role_name.to_s)
    self.roles -= [role]
  end
  
  def admin?
    role_symbols.include?(:admin)
  end
  
  def can_edit?(object)
    return object.can_be_edited_by?(self) if object.instance_of?(User) || object.instance_of?(LocalUser) || object.instance_of?(Channel)
    return false
  end
  
  def can_be_edited_by?(user)
    self.id != 0 && self.type != "FacebookUser" && self.type != "TwitterUser" && !user.stranger? && (user.admin? || user.id == self.id)
  end
  
  def invitee?
    roles.size == 1 && roles.first.title == "invitee"
  end

  def mark_invitation_as_accepted
    invitation = Invitation.unaccepted.find_by_token(invitation_token)
    invitation.accepted_at = Time.now
    invitation.invitee = self
    invitation.save
  end

  def listen_to_channels
    (channels_to_subscribe || []).each { |channel|
      Listen.create({
        :channel => channel,
        :user => self,
        :verified => 1
      })
    }
  end
  
  def after_token_authentication
    update_attribute(:authentication_token, nil)
  end
  
  def self.generate_valid_name(name)
    name.gsub(/[^0-9A-Za-z]/, '.')
  end
  
  def generate_login_from_name(step = 1)
    return if login
    value = "#{first_name} #{last_name}".parameterize(".")
    value << "#{step}" if step > 1
    conflict = User.find_by_login(value)
    self.login = if conflict 
      generate_login_from_name(step+1)
    else
      value
    end
  end
  
  # create a user with a session id
  def self.stranger(identifier)
    find_or_create_by_temporary_identifier(identifier) do |u|
      u.first_name = "guest"
      u.last_name = identifier.downcase.gsub(/[^\w]/, '')[0, 5]
      u.email = "#{u.first_name}.#{u.last_name}@local.guest"
    end
  end
  
  def self.all_strangers
    all(:conditions => "temporary_identifier IS NOT NULL")
  end
  
  def self.delete_strangers_older_than_two_days!
    destroy_all(["temporary_identifier IS NOT NULL AND updated_at < ?", Time.now - 2.days])
  end
  
  def stranger?
    !temporary_identifier.blank?
  end
  
  def pending_channel_verifications
    channs = if admin?
      Channel.local.real
    else
      owned_channels
    end
    channs.includes(:listens).
    where(:listens => {:verified => false}).
    inject({}) { |hash, channel|
      hash[channel.id] = channel.listens.where(:verified => false).count
      hash
    }
  end
  
  def assign_roles_and_channels
    if invitation_token
      if invitation = Invitation.unaccepted.find_by_token(invitation_token)
        self.channels_to_subscribe = Channel.find(invitation.channel_ids)
        self.roles = if invitation.role == 'admin'
            [Role.find_by_title('user'), Role.find_by_title('admin')]
          else
            [Role.find_by_title(invitation.role)]
          end
      else
        errors.add_to_base("The invitation token is invalid.")
        return false
      end
    else
      self.channels_to_subscribe ||= Channel.public.where(:id => SystemPreferences.default_channel_ids)
      self.roles = [Role.find_by_title(stranger? ? SystemPreferences.default_stranger_user_group : SystemPreferences.default_registered_user_group)]
    end
  end
  
  def create_folder
    FileUtils.mkdir_p("#{configatron.files_path}/users/#{id}", :mode => 0750)
    FileUtils.mkdir_p("#{configatron.files_path}/system_users/#{login}/channels", :mode => 0750)
    system_users_script("mount users/#{id} \"system_users/#{login}/my private folder\"")
  end
  
  def delete_folder
    FileUtils.rm_rf("#{configatron.files_path}/users/#{id}")
    FileUtils.rm_rf("#{configatron.files_path}/system_users/#{login}")
  end

  def update_system_user_folder
    if login_changed? # login_changed?
      `mv #{configatron.files_path}/system_users/#{login_was} #{system_home_path}`
      # rename all rendevouz folder
      channels.rendezvous.each do |rendevouz|
        participant = (rendevouz.rendezvous_participants - [self]).first
        `mv "#{participant.system_home_path}/channels/shared between you and #{login_was}" "#{participant.system_home_path}/channels/shared between you and #{login}"`
      end
      self.class.refresh_system_users
    end
  end
  
  def system_home_path
    configatron.files_path + "/system_users/#{login}"
  end
  
  def self.refresh_system_users
    data = []
    User.registered.each_with_index do |user, i|
      data << "#{user.login}:x:#{8000 + i}:#{`getent group protonet | cut -d: -f3`.strip}:#{user.login},,,:#{user.system_home_path}:/bin/false" # bin/false so you can't login to shell
    end
    # TODO: harden security of this
    File.open(configatron.extrausers_passwd, 'w') {|f| f.puts(data.join("\n")) }
  end
  
  def refresh_system_users
    self.class.refresh_system_users
  end
  
  def system_users_script(command)
    if Rails.env.production?
      `/usr/bin/sudo #{Rails.root}/script/init/system_users #{command}`
    else
      `#{Rails.root}/script/init/system_users #{command}`
    end
  end
  
  def handle_admin(role)
    if role.title == "admin"
      # Only create a system message when there's someone in listening
      # This avoids creating a system message for user "admin" during "rake db:setup"
      if Channel.system.users.registered.size > 0
        Meep.create_system_message("The user @#{self.display_name} is now an administrator") 
      end
      
      subscribe(Channel.system)
      subscribe(Channel.support) if Rails.env.production?
    end
  end
  
  def unhandle_admin(role)
    if role.title == "admin"
      unsubscribe(Channel.system)
      Meep.create_system_message("The user @#{self.display_name} is no longer an administrator")
    end
  end
  
  # handle last_seen for notifying about unread messages
  # sets last_seen to NULL (still online)
  def save_online_status
    self.update_attribute(:last_seen, nil)
    self.delete_notifications
  end
  
  # sets last_seen to Time.now
  def save_offline_status
    self.update_attribute(:last_seen, Time.now)
  end
  
  def delete_notifications
    Notification.where(:subject_id => self.id, :subject_type => self.class).delete_all
  end
  
end 

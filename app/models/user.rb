require 'digest/sha1'

class User < ActiveRecord::Base
  include Rabbit
  
  devise :database_authenticatable, :registerable, :encryptable, :rememberable, :token_authenticatable, :encryptor => :restful_authentication_sha1

  attr_accessible :login, :email, :name, :password, :password_confirmation, :avatar_url,
    :channels_to_subscribe, :external_profile_url, :node, :node_id

  attr_accessor :channels_to_subscribe, :invitation_token, :avatar_url

  belongs_to :node
  has_many  :meeps
  has_many  :listens,  :dependent => :destroy
  has_many  :channels,          :through => :listens, :select => "channels.*, listens.id AS listen_id, listens.last_read_meep as last_read_meep"
  has_many  :owned_channels,    :class_name => 'Channel', :foreign_key => :owner_id
  has_many  :invitations
  has_and_belongs_to_many  :roles
  has_attached_file :avatar, :default_url => configatron.default_avatar
  
  
  scope :registered, :conditions => "temporary_identifier IS NULL AND users.id != -1 AND users.node_id = 1"
  scope :strangers,  :conditions => "temporary_identifier IS NOT NULL"
  
  before_validation :download_remote_avatar, :if => :avatar_url_provided?
  after_validation :assign_roles_and_channels, :on => :create
  
  after_create :send_create_notification, :unless => :anonymous?
  after_create :listen_to_channels, :unless => :anonymous?
  after_create :mark_invitation_as_accepted, :if => :invitation_token
  
  after_destroy :move_meeps_to_anonymous
  after_destroy :move_owned_channels_to_anonymous
  
  validates_uniqueness_of :email, :if => lambda {|u| !u.stranger?}
  
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
      user = new(:name => 'System', :login => 'system')
      user.id = -1
      user.save!(:validate => false)
      find(-1)
    end
  end
  
  def self.admins
    Role.find_by_title('admin').users
  end
  
  def self.recent_active
    find(
      Meep.connection.select_values("
        SELECT user_id, count(meeps.id) as counter FROM meeps left outer join users on users.id = meeps.user_id
        WHERE users.temporary_identifier IS NULL AND (users.id != -1) AND meeps.created_at > '#{(Time.now - 2.weeks).to_s(:db)}'
        GROUP BY user_id ORDER BY counter DESC, meeps.id DESC LIMIT 20
      ")
    )
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

  def login=(value)
    write_attribute :login, (value ? value.downcase : nil)
  end

  def email=(value)
    write_attribute :email, (value ? value.downcase : nil)
  end

  def display_name
    name.blank? ? login : name
  end

  def skip_password_validation?
    !new_record? || stranger?
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
    
    publish 'system', ['users', 'new'],
      :trigger   => 'user.added',
      :id        => id,
      :name      => display_name,
      :avatar    => avatar.url
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

  def password_required_with_logged_out_user?
    skip_validation ? false : password_required_without_logged_out_user?
  end
  
  def add_to_role(role_name)
    role = Role.find_by_title!(role_name.to_s)
    self.roles << role unless roles.include?(role)
    unsubscribe(Channel.system) if role_name == 'admin'
  end
  
  def remove_from_role(role_name)
    role = Role.find_by_title!(role_name.to_s)
    self.roles -= [role]
    unsubscribe(Channel.system) if role_name == 'admin'
  end
  
  def admin?
    role_symbols.include?(:admin)
  end
  
  def can_edit?(user)
    user.can_be_edited_by?(self)
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
    (channels_to_subscribe || []).each { |channel | subscribe(channel) }
  end
  
  def after_token_authentication
    update_attribute(:authentication_token, nil)
  end
  
  def self.generate_valid_name(name)
    name.gsub(/[^0-9A-Za-z]/, '.')
  end
  
  # create a user with a session id
  def self.stranger(identifier)
    u = find_or_create_by_temporary_identifier(identifier)  do |u|
      u.name = "stranger_#{identifier[0,10]}"
      u.email = "#{u.name}@local.stranger"
    end
    u
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
  
  def channel_uuid_to_id_mapping
    mapping = {}
    channels.each {|c| mapping[c.uuid] = c.id }
    mapping
  end
  
  def assign_roles_and_channels
    if invitation_token
      if invitation = Invitation.unaccepted.find_by_token(invitation_token)
        self.channels_to_subscribe = Channel.find(invitation.channel_ids).to_a
        self.roles = [Role.find_by_title('invitee')]
      else
        errors.add_to_base("The invitation token is invalid.")
        return false
      end
    else
      self.channels_to_subscribe ||= [Channel.home]
      self.roles = [Role.find_by_title(stranger? ? SystemPreferences.default_stranger_user_group : SystemPreferences.default_registered_user_group)]
    end
  end
  
end


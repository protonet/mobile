require 'digest/sha1'

class User < ActiveRecord::Base
  include Rabbit

  NAME_REGEX    = /\A[\w\.\-\_]*\z/
  EMAIL_REGEX   = /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  BAD_NAME_MSG  = "use only letters, numbers, and .-_ please."
  BAD_EMAIL_MSG = "should look like an email address."

  devise :database_authenticatable, :registerable, :encryptable, :rememberable, :token_authenticatable, :encryptor => :restful_authentication_sha1

  with_options :unless => :skip_credentials_validation? do |v|
    v.validates_presence_of       :login, :email
    v.validates_uniqueness_of     :login, :email
    v.validates_length_of         :login,    :within => 3..40
    v.validates_format_of         :login,    :with => NAME_REGEX, :message => BAD_NAME_MSG
    v.validates_format_of         :email,    :with => EMAIL_REGEX, :message => BAD_NAME_MSG, :allow_nil => false
    v.validates_format_of         :name,     :with => NAME_REGEX,  :message => BAD_NAME_MSG, :allow_nil => true
    v.validates_length_of         :name,     :maximum => 100
  end
  
  with_options :unless => :skip_password_validation? do |v|
    v.validates_presence_of     :password
    v.validates_confirmation_of :password
    v.validates_length_of       :password, :within => 6..20, :allow_blank => true
  end
  

  attr_accessible :login, :email, :name, :password, :password_confirmation, :avatar_url, :channels_to_subscribe, :external_profile_url
  attr_accessor :channels_to_subscribe, :invitation_token, :avatar_url

  has_many  :meeps
  has_many  :listens,  :dependent => :destroy
  has_many  :channels,          :through => :listens, :order => :order_number, :select => "channels.*, listens.id AS listen_id, listens.last_read_meep as last_read_meep"
  has_many  :owned_channels,    :class_name => 'Channel', :foreign_key => :owner_id
  has_many  :invitations
  has_and_belongs_to_many  :roles
  has_attached_file :avatar, :default_url => '/img/user_picture.png'
  
  scope :registered, :conditions => {:temporary_identifier => nil}
  scope :strangers,  :conditions => "temporary_identifier IS NOT NULL"
  
  before_validation :download_remote_avatar, :if => :avatar_url_provided?
  after_validation :assign_roles_and_channels, :on => :create
  
  after_create :create_ldap_user if configatron.ldap.active == true
  after_create :send_create_notification, :unless => :anonymous?
  after_create :listen_to_channels, :unless => :anonymous?
  after_create :mark_invitation_as_accepted, :if => :invitation_token
  
  after_destroy :move_meeps_to_anonymous
  after_destroy :move_owned_channels_to_anonymous

  def self.anonymous
    begin
      find(-1)
    rescue ActiveRecord::RecordNotFound
      user = new(:name => 'Anonymous', :login => 'Anonymous')
      user.id = -1
      user.save!(:validate => false)
      find(-1)
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

  def self.ldap_authenticate(login, password)
    # try to authenticate against the LDAP server
    ldap = Net::LDAP.new
    ldap.host = SystemPreferences.remote_ldap_host
    ldap.port = 636
    ldap.encryption :simple_tls # also required to tell Net:LDAP that we want SSL
    ldap.base = SystemPreferences.remote_ldap_base
    ldap.auth "#{login}@#{SystemPreferences.remote_ldap_domain}","#{password}"
    if ldap.bind # will return false if authentication is NOT successful
      find_by_login(login.downcase) || begin
        generated_password = ActiveSupport::SecureRandom.base64(10)
        User.create({:login => login, :email => "#{login}@#{SystemPreferences.remote_ldap_domain}", :password => generated_password, :password_confirmation => generated_password})
      end
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

  # create a user with a session id
  def self.stranger(identifier)
    u = find_or_create_by_temporary_identifier(identifier)  do |u|
      u.name = "stranger_#{identifier[0,10]}"
    end
    u
  end

  def self.all_strangers
    all(:conditions => "temporary_identifier IS NOT NULL")
  end

  def move_meeps_to_anonymous
    meeps.each {|t| t.update_attribute(:user_id, -1)}
  end

  def move_owned_channels_to_anonymous
    owned_channels.each {|t| t.update_attribute(:owner_id, -1)}
  end

  def self.delete_strangers_older_than_two_days!
    destroy_all(["temporary_identifier IS NOT NULL AND updated_at < ?", Time.now - 2.days]).each {|user| user.meeps.each {|t| t.update_attribute(:user_id, -1)}}
  end
  
  def anonymous?
    id == -1
  end
  
  def stranger?
    !temporary_identifier.blank?
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

  def create_ldap_user
    LdapUser.create_for_user(self) unless stranger?
  end

  def send_create_notification
    return if stranger?
    
    publish 'system', ['users', 'new'],
      :trigger   => 'user.added',
      :id        => id,
      :name      => display_name,
      :avatar    => avatar.url,
      :external_profile_url => external_profile_url
  end

  def subscribe(channel)
    return if channels.include?(channel)
    channels << channel
  end

  def unsubscribe(channel)
    return unless channels.include?(channel)
    channels.delete(channel)
    save
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
  end
  
  def remove_from_role(role_name)
    role = Role.find_by_title!(role_name.to_s)
    self.roles -= [role]
  end
  
  def admin?
    role_symbols.include?(:admin)
  end
  
  def make_admin(key)
    return :admin_already_set if SystemPreferences.admin_set == true
    if key == SystemPreferences.admin_key
      (add_to_role(:admin) && SystemPreferences.admin_set = true) ? :ok : :error
    else
      :key_error
    end
  end
  
  def can_edit?(user)
    user.can_be_edited_by?(self)
  end
  
  def can_be_edited_by?(user)
    self.id != 0 && !user.stranger? && (user.admin? || user.id == self.id)
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
  
  def avatar_url_provided?
    !avatar_url.blank?
  end
  
  def download_remote_avatar
    # open a tempfile using the last 14 chars of the filename
    t = Tempfile.new(avatar_url.parameterize.slice(-14, 14))
    t.write(open(avatar_url).read)
    t.flush
    self.avatar = t
  end
  
end

# devise ldap monkey patch
require "#{Rails.root}/lib/devise_ext"

require 'digest/sha1'
require 'net/ldap' if configatron.ldap.single_authentication == true

class User < ActiveRecord::Base
  include Rabbit

  NAME_REGEX    = /\A[^[:cntrl:]\\<>\/&]*\z/
  BAD_NAME_MSG  = "use only letters, numbers, and .-_@ please."
  BAD_EMAIL_MSG = "should look like an email address."

  devise :database_authenticatable, :registerable

  validates_presence_of     :login,    :unless => :skip_validation
  validates_length_of       :login,    :within => 3..40, :unless => :skip_validation
  validates_uniqueness_of   :login,    :unless => :skip_validation
  validates_format_of       :login,    :with => NAME_REGEX, :message => BAD_EMAIL_MSG, :unless => :skip_validation

  validates_format_of       :name,     :with => NAME_REGEX,  :message => BAD_NAME_MSG, :allow_nil => true, :unless => :skip_validation
  validates_length_of       :name,     :maximum => 100, :unless => :skip_validation
  
  # TODO: Grandfather these in somehow
  #validates_presence_of     :email,    :unless => :skip_validation
  #validates_uniqueness_of   :email,    :unless => :skip_validation
  #validates_format_of       :email,    :with => Authentication.email_regex, :message => Authentication.bad_email_message, :unless => :skip_validation

  # HACK HACK HACK -- how to do attr_accessible from here?
  # prevents a user from submitting a crafted form that bypasses activation
  # anything else you want your user to change should be added here.
  attr_accessible :login, :email, :name, :password, :password_confirmation

  has_many  :tweets
  has_many  :listens,  :dependent => :destroy
  has_many  :channels,          :through => :listens
  has_many  :owned_channels,    :class_name => 'Channel', :foreign_key => :owner_id
  has_one   :avatar, :class_name => 'Images::Avatar', :dependent => :destroy

  named_scope :registered, :conditions => {:temporary_identifier => nil}

  after_create :create_ldap_user if configatron.ldap.active == true
  after_create :send_create_notification
  after_create :listen_to_home

  after_destroy :move_tweets_to_anonymous
  after_destroy :move_owned_channels_to_anonymous

  def self.anonymous
    begin
      find(0)
    rescue ActiveRecord::RecordNotFound
      user = new(:name => 'Anonymous', :login => 'Anonymous')
      # no callback for this one
      user.send(:create_without_callbacks) && update_all("id = 0", "id = #{user.id}")
      find(0)
    end
  end
  
  # Authenticates a user by their login name and unencrypted password.  Returns the user or nil.
  #
  # uff.  this is really an authorization, not authentication routine.
  # We really need a Dispatch Chain here or something.
  # This will also let us return a human error message.
  #
  def self.authenticate(login, password)
    return nil if login.blank? || password.blank?
    return ldap_authenticate(login, password) if configatron.ldap.single_authentication == true

    u = find_by_login(login.downcase) # need to get the salt
    u && u.authenticated?(password) ? u : nil
  end

  def self.ldap_authenticate(login, password)
    # try to authenticate against the LDAP server
    ldap = Net::LDAP.new
    ldap.host = configatron.ldap.host
    ldap.port = 636
    ldap.encryption :simple_tls # also required to tell Net:LDAP that we want SSL
    ldap.base = configatron.ldap.base
    ldap.auth "#{login}@#{configatron.ldap.domain}","#{password}"
    if ldap.bind # will return false if authentication is NOT successful
      find_by_login(login.downcase) || begin
        generated_password = ActiveSupport::SecureRandom.base64(10)
        user = User.new({:login => login, :password => generated_password, :password_confirmation => generated_password})
        user if user.save
      end
    end
  end

  def generate_new_communication_token
    self.communication_token = Devise.friendly_token
    self.communication_token_expires_at = Time.now + 5.day
    save
    # todo: propagate
  end

  def communication_token
    generate_new_communication_token unless communication_token_expires_at && communication_token_expires_at > Time.now
    read_attribute(:communication_token)
  end

  def communication_token_valid?(token)
    token && token == read_attribute(:communication_token) && communication_token_expires_at > DateTime.now
  end

  def reset_password(new_password)
    self.password               = new_password
    self.password_confirmation  = new_password
    save
  end

  # create a user with a session id
  def self.stranger(session_id)
    u = find_or_create_by_temporary_identifier(session_id)  do |u|
      u.name = "stranger_#{session_id[0,10]}"
      u.listen_to_home
    end
    u
  end

  def self.all_strangers
    all(:conditions => "temporary_identifier IS NOT NULL")
  end

  def move_tweets_to_anonymous
    tweets.each {|t| t.update_attribute(:user_id, 0)}
  end

  def move_owned_channels_to_anonymous
    owned_channels.each {|t| t.update_attribute(:owner_id, 0)}
  end

  def self.delete_strangers_older_than_two_days!
    destroy_all(["temporary_identifier IS NOT NULL AND updated_at < ?", Time.now - 2.days]).each {|user| user.tweets.each {|t| t.update_attribute(:user_id, 0)}}
  end

  def stranger?
    !temporary_identifier.blank? || id == 1
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

  def verified_channels
    channels.all(:conditions => ['listens.flags = 1'])
  end

  def listen_to_home
    return if listening_to_home?
    subscribe(Channel.home)
  end

  def listening_to_home?
    channels.try(:include?, Channel.home)
  end

  # skip validation if the user is a logged out (stranger) user
  def skip_validation
    stranger?
  end

  def create_ldap_user
    Ldap::User.create_for_user(self) unless stranger?
  end

  def send_create_notification
    return if stranger?
    
    publish 'system', ['users', 'new'],
      :trigger   => 'user.added',
      :id        => id,
      :name      => display_name
  end

  def subscribe(channel)
    return if channels.include?(channel)
    channels << channel
    send_channel_notification(channel, :subscribed_channel) if save
  end

  def unsubscribe(channel)
    return unless channels.include?(channel)
    channels.delete(channel)
    send_channel_notification(channel, :unsubscribed_channel) if save
  end

  def subscribed?(channel)
    channels.include?(channel)
  end

  def send_channel_notification(channel, type)
    publish 'channels', channel.uuid,
      :trigger        => "user.#{type}",
      :channel_id     => channel.id,
      :user_id        => id
  end

  def password_required_with_logged_out_user?
    skip_validation ? false : password_required_without_logged_out_user?
  end
  alias_method_chain :password_required?, :logged_out_user

  def active_avatar_url
    avatar ? "/images/avatars/#{avatar.id}" : '/img/user_picture.png'
  end
  
  def has_avatar?
    !!avatar
  end
end

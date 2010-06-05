require 'digest/sha1'
require 'net/ldap' if configatron.ldap.single_authentication == true

class User < ActiveRecord::Base
  include Authentication
  include Authentication::ByPassword
  include Authentication::ByCookieToken

  validates_presence_of     :login,    :unless => :skip_validation
  validates_length_of       :login,    :within => 3..40, :unless => :skip_validation
  validates_uniqueness_of   :login,    :unless => :skip_validation
  validates_format_of       :login,    :with => Authentication.login_regex, :message => Authentication.bad_login_message, :unless => :skip_validation

  validates_format_of       :name,     :with => Authentication.name_regex,  :message => Authentication.bad_name_message, :allow_nil => true, :unless => :skip_validation
  validates_length_of       :name,     :maximum => 100, :unless => :skip_validation

  # HACK HACK HACK -- how to do attr_accessible from here?
  # prevents a user from submitting a crafted form that bypasses activation
  # anything else you want your user to change should be added here.
  attr_accessible :login, :email, :name, :password, :password_confirmation

  has_many  :tweets
  has_many  :listens, :dependent => :destroy
  has_many  :channels, :through => :listens
  has_many  :owned_channels, :class_name => 'Channel', :foreign_key => :owner_id, :dependent => :nullify
  has_many  :avatars, :class_name => 'Images::Avatar', :dependent => :destroy
  
  named_scope :registered, :conditions => {:temporary_identifier => nil}

  after_create :create_ldap_user if configatron.ldap.active == true
  after_create :listen_to_home, :send_create_notification

  after_destroy :move_tweets_to_anonymous

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
    self.communication_token = self.class.make_token
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
      u.name = "stranger_number_#{session_id[0,10]}"
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

  def self.delete_strangers_older_than_two_days!
    destroy_all(["temporary_identifier IS NOT NULL AND updated_at < ?", Time.now - 2.days]).each {|user| user.tweets.each {|t| t.update_attribute(:user_id, 0)}}
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
  
  def listen_to_home
    return if listening_to_home?
    channels << Channel.home
    save
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
    unless stranger?
      System::MessagingBus.topic('system').publish({
        :trigger        => 'user.added',
        :user_id        => id,
        :user_name      => display_name,
        :avatar_url     => active_avatar_url
        }.to_json, :key => 'system.users.new')
    end
  end
  
  def subscribe(channel)
    return if channels.include?(channel)
    channels << channel
    send_channel_notification(channel, :subscribe) if save
  end
  
  def unsubscribe(channel)
    return unless channels.include?(channel)
    channels.delete(channel)
    send_channel_notification(channel, :unsubscribe) if save
  end
  
  def send_channel_notification(channel, type)
    System::MessagingBus.topic('channels').publish({
      :trigger        => "channel.#{type}",
      :channel_id     => channel.id,
      :user_id        => id,
      :user_name      => display_name,
      :avatar_url     => active_avatar_url,
      :x_target       => 'protonet.globals.notifications[0].triggerNotification'
      }.to_json, :key => "channels.#{channel.id}")
  end

  def password_required_with_logged_out_user?
    skip_validation ? false : password_required_without_logged_out_user?
  end
  alias_method_chain :password_required?, :logged_out_user
  
  def avatar
    avatars.last
  end
  
  def active_avatar_url
    avatar ? "/images/avatars/#{avatar.id}" : '/images/userpicture.jpg'
  end
end

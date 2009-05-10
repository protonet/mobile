require 'digest/sha1'

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
  has_many  :listens
  has_many  :audiences, :through => :listens

  after_create :listen_to_home

  # Authenticates a user by their login name and unencrypted password.  Returns the user or nil.
  #
  # uff.  this is really an authorization, not authentication routine.  
  # We really need a Dispatch Chain here or something.
  # This will also let us return a human error message.
  #
  def self.authenticate(login, password)
    return nil if login.blank? || password.blank?
    u = find_by_login(login.downcase) # need to get the salt
    u && u.authenticated?(password) ? u : nil
  end
  
  def generate_new_communication_token
    self.communication_token = self.class.make_token
    self.communication_token_expires_at = Time.now + 1.day
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
  
  # create a user with a session id
  def self.coward(session_id)
    u = User.find_or_create_by_temporary_identifier(session_id)  do |u|
      u.name = "coward_number_#{session_id[0,10]}"
      u.listen_to_home
    end
    u
  end
  
  def logged_out?
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
    audiences << Audience.home
    save
  end
  
  def listening_to_home?
    audiences.try(:include?, Audience.home)
  end
  
  # skip validation if the user is a logged out user
  def skip_validation
    logged_out?
  end
  

  def password_required_with_logged_out_user?
    skip_validation ? false : password_required_without_logged_out_user?
  end
  alias_method_chain :password_required?, :logged_out_user
  
  protected
    


end

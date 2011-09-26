require 'digest/sha1'

class LocalUser < User
  include Rabbit

  NAME_REGEX    = /\A[\w\.\-\_]*\z/
  EMAIL_REGEX   = /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  BAD_NAME_MSG  = "use only letters, numbers, and .-_ please."
  BAD_EMAIL_MSG = "should look like an email address."

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
  
  after_create :create_ldap_user if configatron.ldap.active == true
  
  def create_ldap_user
    LdapUser.create_for_user(self) unless stranger?
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
        create({:login => login, :email => "#{login}@#{SystemPreferences.remote_ldap_domain}", :password => generated_password, :password_confirmation => generated_password})
      end
    end
  end

end

# devise ldap monkey patch
require "#{Rails.root}/lib/devise_ext"

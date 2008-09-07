class User
  include DataMapper::Resource
  
  before :save, :encrypt_password
  
  attr_accessor :password, :password_confirmation
  
  property :id,                         Integer,  :serial => true
  property :name,                       String,   :nullable => false, :length => 3..40, :unique => true
  property :login,                      String,   :nullable => false, :unique => true
  property :crypted_password,           String
  property :salt,                       String
  property :remember_token_expires_at,  DateTime
  property :remember_token,             String
  property :realm_id,                   String
  
  validates_length            :login,                   :within => 3..40
  validates_is_unique         :login
  validates_present           :password
  validates_present           :password_confirmation
  validates_length            :password,                :within => 4..40
  validates_is_confirmed      :password,                :groups => :create
  
  def self.current
    User.new
  end
  
  def self.current=(user)
    
  end
  
  def logged_in?
    false
  end
  
  
  private
    def encrypt_password
      return if password.blank?
      salt = Digest::SHA1.hexdigest("--#{Time.now.to_s}--#{login}--") if new_record?
      crypted_password = encrypt(password, salt)
    end
  
    # Encrypts some data with the salt.
    def encrypt(password, salt)
      Digest::SHA1.hexdigest("--#{salt}--#{password}--")
    end
  
  
end
